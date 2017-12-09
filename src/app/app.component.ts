import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  sideNaveOpened = false;

  constructor(public auth: AuthService) {
    auth.handleAuthentication();
  }

  toggleSideNav() {
    this.sideNaveOpened = !this.sideNaveOpened;
  }

  closeSideNav() {
    this.sideNaveOpened = false;
  }

}
