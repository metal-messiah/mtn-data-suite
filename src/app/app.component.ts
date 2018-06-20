import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { RoutingStateService } from './core/services/routing-state.service';

@Component({
  selector: 'mds-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  showHomeNav = true;

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private routingState: RoutingStateService
  ) {
    auth.handleAuthentication();
    routingState.loadRouting();
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.showHomeNav = (val.url !== '/');
      }
    });
  }

}
