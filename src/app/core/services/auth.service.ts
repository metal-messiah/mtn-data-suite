import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as auth0 from 'auth0-js';
import { environment } from '../../../environments/environment';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RestService } from './rest.service';
import { UserProfile } from '../../models/full/user-profile';
import { ErrorDialogComponent } from '../../shared/error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs/index';

@Injectable()
export class AuthService {

  sessionUser: UserProfile;
  accessToken: string;
  idToken: string;
  tokenExpirationTime: number;
  latestPath: string;

  auth0 = new auth0.WebAuth({
    clientID: environment.AUTH_CONFIG.clientID,
    domain: environment.AUTH_CONFIG.domain,
    responseType: 'token id_token',
    audience: 'mtn-rest-api',
    redirectUri: environment.AUTH_CONFIG.callbackURL,
    scope: 'openid email profile'
  });

  constructor(public router: Router,
              private location: Location,
              private http: HttpClient,
              private rest: RestService,
              private dialog: MatDialog) {
    const storedSessionUser = localStorage.getItem('session_user');
    const storedAccessToken = localStorage.getItem('access_token');
    const storedIdToken = localStorage.getItem('id_token');
    const storedTokenExpirationTime = localStorage.getItem('expiration_time');
    const storedLatestPath = localStorage.getItem('latest_path');
    if (storedSessionUser != null) {
      this.sessionUser = JSON.parse(storedSessionUser);
    }
    if (storedAccessToken != null) {
      this.accessToken = storedAccessToken;
    }
    if (storedIdToken != null) {
      this.idToken = storedIdToken;
    }
    if (storedTokenExpirationTime != null) {
      this.tokenExpirationTime = JSON.parse(storedTokenExpirationTime);
    }
    if (storedLatestPath != null) {
      this.latestPath = storedLatestPath;
    }
  }

  public signIn(): void {
    localStorage.clear();
    localStorage.setItem('latest_path', this.location.path());
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
        this.getUserProfile().subscribe(
          userProfile => {
            this.sessionUser = userProfile;
            localStorage.setItem('session_user', JSON.stringify(userProfile));
            this.router.navigate([localStorage.getItem('latest_path')]);
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

  private setSession(authResult): void {
    // Set the time that the access token will expire at
    const expirationTime = (authResult.expiresIn * 1000) + new Date().getTime();
    const expirationDate = new Date();
    expirationDate.setTime(expirationTime);
    console.log(`Session expires at ${expirationDate}`);
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expiration_time', JSON.stringify(expirationTime));
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.clear();
    // Go back to the home route
    this.router.navigate(['/']);
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expiration_time'));
    return new Date().getTime() < expiresAt;
  }

}
