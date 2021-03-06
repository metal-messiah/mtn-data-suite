import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService) {
  }

  canActivate(next: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isLoaded) {
      if (this.authService.isAuthenticated()) {
        return true;
      } else {
        this.authService.signIn();
        return false;
      }
    } else {
      return this.authService.loadSavedAuthentication().pipe(tap(authenticated => {
        if (!authenticated) {
          this.authService.signIn();
        }
      }));
    }
  }

}
