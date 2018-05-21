import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import * as auth0 from 'auth0-js';
import {environment} from '../../../environments/environment';
import {Location} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {RestService} from './rest.service';
import {UserProfile} from '../../models/user-profile';
import {Observable} from 'rxjs/Observable';
import {ErrorDialogComponent} from '../../shared/error-dialog/error-dialog.component';
import {MatDialog} from '@angular/material';

@Injectable()
export class AuthService {

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
  }

  public signIn(): void {
    localStorage.clear();
    localStorage.setItem('loggingInFrom', this.location.path());
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
        this.getUserProfile().subscribe(
          userProfile => {
            localStorage.setItem('user_profile', JSON.stringify(userProfile));
            const redirectTo = localStorage.getItem('loggingInFrom');
            this.router.navigate([redirectTo]);
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
    localStorage.setItem('expires_at', JSON.stringify(expirationTime));
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
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

}
