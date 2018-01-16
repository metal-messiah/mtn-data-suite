import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import * as auth0 from 'auth0-js';
import {environment} from '../../../environments/environment';
import {Location} from '@angular/common';

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

  constructor(public router: Router, private location: Location) {}

  public login(): void {
    localStorage.setItem('loggingInFrom', this.location.path());
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
        const redirectTo = localStorage.getItem('loggingInFrom');
        this.router.navigate([redirectTo]);
      } else if (err) {
        this.router.navigate(['/home']);
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  }

  private setSession(authResult): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
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
