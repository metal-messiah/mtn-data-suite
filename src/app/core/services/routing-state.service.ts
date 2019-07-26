import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable()
export class RoutingStateService {

  private history = [];

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(({urlAfterRedirects}: NavigationEnd) => this.history.push(urlAfterRedirects));
  }

  getPreviousUrl(): string {
    return this.history[this.history.length - 2] || '/index';
  }

}
