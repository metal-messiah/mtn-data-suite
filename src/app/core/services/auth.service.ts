import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as auth0 from 'auth0-js';
import { environment } from '../../../environments/environment';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RestService } from './rest.service';
import { UserProfile } from '../../models/full/user-profile';
import { forkJoin, Observable, Observer } from 'rxjs';
import { finalize, map, mergeMap, tap } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { SimplifiedPermission } from '../../models/simplified/simplified-permission';

@Injectable()
export class AuthService {

  private readonly ST_SESSION_USER = 'session_user';
  private readonly ST_ACCESS_TOKEN = 'access_token';
  private readonly ST_ID_TOKEN = 'id_token';
  private readonly ST_EXPIRATION_TIME = 'expiration_time';
  private readonly ST_LATEST_PATH = 'latest_path';

  sessionUser: UserProfile;
  private tokenExpirationTime: number;

  isLoaded = false;

  auth0 = new auth0.WebAuth({
    clientID: environment.AUTH_CONFIG.clientID,
    domain: environment.AUTH_CONFIG.domain,
    responseType: 'token id_token',
    audience: 'mtn-rest-api',
    redirectUri: environment.AUTH_CONFIG.callbackURL,
    scope: 'openid email profile'
  });

  constructor(private router: Router,
              private location: Location,
              private http: HttpClient,
              private rest: RestService,
              private storageService: StorageService) {
  }

  public loadSavedAuthentication() {
    const getSessionUser = this.storageService.getOne(this.ST_SESSION_USER).pipe(tap(storedSessionUser => {
      if (storedSessionUser) {
        this.sessionUser = new UserProfile(storedSessionUser);
      }
    }));
    const getAccesToken = this.storageService.getOne(this.ST_ACCESS_TOKEN).pipe(tap(storedAccessToken => {
      if (storedAccessToken) {
        this.rest.setAccessToken(storedAccessToken);
      }
    }));
    const getExpirationTime = this.storageService.getOne(this.ST_EXPIRATION_TIME).pipe(tap(storedTokenExpirationTime => {
      if (storedTokenExpirationTime) {
        this.tokenExpirationTime = storedTokenExpirationTime;
      }
    }));
    return forkJoin([getSessionUser, getAccesToken, getExpirationTime])
      .pipe(finalize(() => this.isLoaded = true))
      .pipe(map(() => this.isAuthenticated()));
  }

  private parseAuthResult(authResult): Observable<any> {
    this.rest.setAccessToken(authResult.accessToken);

    // Set the time that the access token will expire at
    const expirationTime = (authResult.expiresIn * 1000) + new Date().getTime();
    this.tokenExpirationTime = expirationTime;

    const expirationDate = new Date();
    expirationDate.setTime(expirationTime);
    console.log(`Session expires at ${expirationDate}`);

    const saveAccessToken = this.storageService.set(this.ST_ACCESS_TOKEN, authResult.accessToken);
    const saveExpirationTime = this.storageService.set(this.ST_EXPIRATION_TIME, expirationTime);

    return forkJoin([saveAccessToken, saveExpirationTime]);
  }


  signIn(): void {
    this.storageService.set(this.ST_LATEST_PATH, this.location.path()).subscribe(() => this.auth0.authorize());
  }

  navigateToLatestPath() {
    this.storageService.getOne(this.ST_LATEST_PATH).subscribe((latestPath: string) => {
      try {
        const parsedUri = decodeURI(latestPath).split('?');
        const queryParams = {};
        if (parsedUri.length > 1) {
          const params = parsedUri[1].split('&');
          params.forEach(param => {
            const keyValue = param.split('=');
            queryParams[keyValue[0]] = keyValue[1];
          });
        }
        this.router.navigate([parsedUri[0]], {queryParams: queryParams});
      } catch (err) {
        console.warn(err);
        this.router.navigate(['']);
      }
    });
  }

  private setSessionUser(userProfile: UserProfile) {
    this.sessionUser = userProfile;
    this.storageService.set(this.ST_SESSION_USER, userProfile).subscribe();
  }

  parseHash(hash: string): Observable<boolean> {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      this.auth0.parseHash({hash: hash}, (err, authResult) => {
        if (authResult && authResult.accessToken) {
          this.parseAuthResult(authResult)
            .pipe(mergeMap(() => this.getUserProfile().pipe(tap(user => this.setSessionUser(user)))))
            .subscribe(() => observer.next(this.isAuthenticated()), saveError => observer.error(saveError));
        } else if (err) {
          this.clearSavedInfo().subscribe(() => observer.error(err));
        } else {
          observer.next(false);
        }
      });
    });
  }

  getUserPermissions() {
    const url = this.rest.getHost() + `/api/auth/user-permissions`;
    return this.http.get<SimplifiedPermission[]>(url, {headers: this.rest.getHeaders()});
  }

  private getUserProfile(): Observable<UserProfile> {
    const url = this.rest.getHost() + `/api/auth/user`;
    return this.http.get<UserProfile>(url, {headers: this.rest.getHeaders()});
  }

  clearSavedInfo(): Observable<any> {
    const tasks = [];
    tasks.push(this.storageService.removeOne(this.ST_SESSION_USER));
    tasks.push(this.storageService.removeOne(this.ST_ACCESS_TOKEN));
    tasks.push(this.storageService.removeOne(this.ST_ID_TOKEN));
    tasks.push(this.storageService.removeOne(this.ST_EXPIRATION_TIME));
    tasks.push(this.storageService.removeOne(this.ST_LATEST_PATH));
    return forkJoin(tasks);
  }

  isAuthenticated(): boolean {
    // Check whether the current time is past the access token's expiry time
    if (this.tokenExpirationTime) {
      return new Date().getTime() < this.tokenExpirationTime;
    } else {
      return false;
    }
  }

}
