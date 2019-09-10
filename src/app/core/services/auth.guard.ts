import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

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
      this.authService.loadSavedAuthentication().subscribe(authenticated => {
        if (authenticated) {
          return true;
        } else {
          this.authService.signIn();
        }
      })
    }
  }

}
