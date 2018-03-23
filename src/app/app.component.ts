import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';

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
    private router: Router
  ) {
    auth.handleAuthentication();
    router.events.subscribe((val) => {
      // console.log(val);
      if (val instanceof NavigationEnd) {
        this.showHomeNav = (val.url !== '/');
      }
    });
  }

}
