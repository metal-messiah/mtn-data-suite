import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as auth0 from 'auth0-js';
import { environment } from '../../../environments/environment';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RestService } from './rest.service';
import { UserProfile } from '../../models/full/user-profile';
import { ErrorDialogComponent } from '../../shared/error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { StorageService } from './storage.service';

@Injectable()
export class AuthService {

  private readonly ST_SESSION_USER = 'session_user';
  private readonly ST_ACCESS_TOKEN = 'access_token';
  private readonly ST_ID_TOKEN = 'id_token';
  private readonly ST_EXPIRATION_TIME = 'expiration_time';
  private readonly ST_LATEST_PATH = 'latest_path';

  sessionUser: UserProfile;
  accessToken: string;
  idToken: string;
  tokenExpirationTime: number;

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
              private storageService: StorageService,
              private dialog: MatDialog) {
    this.getValuesFromStorage();
  }

  private getValuesFromStorage() {
    this.storageService.getOne(this.ST_SESSION_USER).subscribe(storedSessionUser => {
      if (storedSessionUser) {
        this.sessionUser = new UserProfile(storedSessionUser);
      }
    });
    this.storageService.getOne(this.ST_ACCESS_TOKEN).subscribe(storedAccessToken => {
      if (storedAccessToken) {
        this.rest.setAccessToken(storedAccessToken);
        this.accessToken = storedAccessToken;
      }
    });
    this.storageService.getOne(this.ST_ID_TOKEN).subscribe(storedIdToken => {
      if (storedIdToken) {
        this.idToken = storedIdToken;
      }
    });
    this.storageService.getOne(this.ST_EXPIRATION_TIME).subscribe(storedTokenExpirationTime => {
      if (storedTokenExpirationTime) {
        this.tokenExpirationTime = JSON.parse(storedTokenExpirationTime);
      }
    });
  }

  signIn(): void {
    this.storageService.set(this.ST_LATEST_PATH, this.location.path()).subscribe(() => this.auth0.authorize());
  }

  handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.saveSession(authResult).pipe(mergeMap(() => this.getUserProfile()))
          .subscribe((userProfile: UserProfile) => {
            this.sessionUser = userProfile;
            this.storageService.set(this.ST_SESSION_USER, userProfile).subscribe();
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
          },
          error => this.onError(error)
        );
      } else if (err) {
        this.onError(err);
      }
    });
  }

  onError(err): void {
    this.logout();
    const dialogRef = this.dialog.open(ErrorDialogComponent, {
      data: {
        message: 'Login failed!',
        reason: err['error']['message'],
        status: err['status'],
        showRetry: false,
        showLogin: true
      },
      width: '250px'
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response === 'signIn') {
        this.signIn();
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  private getUserProfile(): Observable<UserProfile> {
    const url = this.rest.getHost() + `/api/auth/user`;
    return this.http.get<UserProfile>(url, {headers: this.rest.getHeaders()});
  }

  private saveSession(authResult): Observable<any> {
    // Set the time that the access token will expire at
    const expirationTime = (authResult.expiresIn * 1000) + new Date().getTime();
    const expirationDate = new Date();
    expirationDate.setTime(expirationTime);
    console.log(`Session expires at ${expirationDate}`);
    this.rest.setAccessToken(authResult.accessToken);
    const saveAccessToken = this.storageService.set(this.ST_ACCESS_TOKEN, authResult.accessToken);
    const saveIdToken = this.storageService.set(this.ST_ID_TOKEN, authResult.idToken);
    const saveExpirationTime = this.storageService.set(this.ST_EXPIRATION_TIME, expirationTime);
    return forkJoin([saveAccessToken, saveIdToken, saveExpirationTime]);
  }

  logout(): void {
    const tasks = [];
    tasks.push(this.storageService.removeOne(this.ST_SESSION_USER));
    tasks.push(this.storageService.removeOne(this.ST_ACCESS_TOKEN));
    tasks.push(this.storageService.removeOne(this.ST_ID_TOKEN));
    tasks.push(this.storageService.removeOne(this.ST_EXPIRATION_TIME));
    tasks.push(this.storageService.removeOne(this.ST_LATEST_PATH));
    forkJoin(tasks).subscribe(() => {
      this.router.navigate(['/']).then(() => {
        location.reload();
      });
    });
  }

  isAuthenticated(): Observable<boolean> {
    // Check whether the current time is past the access token's expiry time
    return this.storageService.getOne(this.ST_EXPIRATION_TIME).pipe(map(expirationTime => {
      if (expirationTime) {
        return new Date().getTime() < expirationTime;
      } else {
        return false;
      }
    }));
  }

}
