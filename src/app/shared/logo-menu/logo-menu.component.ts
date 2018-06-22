import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { DatabaseSearchComponent } from '../../casing/database-search/database-search.component';
import { CardState } from '../../casing/casing-dashboard/casing-dashboard.component';
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { MatDialog } from '@angular/material';
import { AppInfoDialogComponent } from '../app-info-dialog/app-info-dialog.component';

@Component({
  selector: 'mds-logo-menu',
  templateUrl: './logo-menu.component.html',
  styleUrls: ['./logo-menu.component.css']
})
export class LogoMenuComponent implements OnInit {

  @Input() showHome = true;

  constructor(public auth: AuthService,
              private dialog: MatDialog) { }

  ngOnInit() {
  }

  openAppInfoDialog() {
    this.dialog.open(AppInfoDialogComponent);
  }

}
