import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AppInfoDialogComponent } from '../app-info-dialog/app-info-dialog.component';

@Component({
  selector: 'mds-logo-menu',
  templateUrl: './logo-menu.component.html',
  styleUrls: ['./logo-menu.component.css']
})
export class LogoMenuComponent implements OnInit {

  isAuthenticated = false;

  @Input() showHome = true;

  constructor(private auth: AuthService,
              private dialog: MatDialog) { }

  ngOnInit() {
    setTimeout(() => this.auth.isAuthenticated().subscribe(authenticated => this.isAuthenticated = authenticated), 500);
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

}
