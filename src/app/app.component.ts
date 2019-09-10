import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingStateService } from './core/services/routing-state.service';
import { UpdateService } from './core/services/update.service';
import { Location } from '@angular/common';
import { AppInfoDialogComponent } from './shared/app-info-dialog/app-info-dialog.component';
import { MatDialog } from '@angular/material';
import { ErrorDialogComponent } from './shared/error-dialog/error-dialog.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'mds-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
    private _location: Location,
    private authService: AuthService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private routingState: RoutingStateService,
    private updateService: UpdateService
  ) {
  }

  ngOnInit() {
    console.log(environment.VERSION);

    if (window.location.pathname === '/callback') {
      this.authService.parseHash(window.location.hash).subscribe(authenticated => {
        this.authService.navigateToLatestPath();
      }, err => this.showErrorDialog(err));
    }
    this.updateService.checkForUpdate();
  }

  private showErrorDialog(err): void {
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
        this.authService.signIn();
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  goHome() {
    this.router.navigate(['']);
  }

  isHomePage() {
    return this._location.isCurrentPathEqualTo('');
  }

  signOut() {
    this.authService.clearSavedInfo().subscribe(() => {
      this.router.navigate(['/']).then(() => location.reload());
    });
  }

  signIn() {
    this.authService.signIn();
  }

  openAppInfoDialog() {
    this.dialog.open(AppInfoDialogComponent);
  }

  goBack() {
    this._location.back();
  }
}
