import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingStateService } from './core/services/routing-state.service';
import { UpdateService } from './core/services/update.service';
import { Location } from '@angular/common';
import { AppInfoDialogComponent } from './shared/app-info-dialog/app-info-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'mds-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [RoutingStateService]
})
export class AppComponent implements OnInit {

  isAuthenticated = false;

  constructor(
    private _location: Location,
    private auth: AuthService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private routingState: RoutingStateService,
    private updateService: UpdateService
  ) {
  }

  ngOnInit() {
    this.auth.handleAuthentication();
    setTimeout(() => this.updateService.checkForUpdate());
    this.auth.isAuthenticated().subscribe(authenticated => this.isAuthenticated = authenticated);
  }

  goHome() {
    this.router.navigate(['']);
  }

  isHomePage() {
    return this._location.isCurrentPathEqualTo('');
  }

  logout() {
    this.auth.logout();
  }

  signIn() {
    this.auth.signIn();
  }

  openAppInfoDialog() {
    this.dialog.open(AppInfoDialogComponent);
  }

  goBack() {
    this._location.back();
  }
}
