import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'mds-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  isAuthenticated = false;

  constructor(private auth: AuthService) {
  }

  ngOnInit() {
    console.log(environment.VERSION);
    this.auth.isAuthenticated().subscribe(authenticated => this.isAuthenticated = authenticated);
  }

  getMenuItems() {
    const menuItems = [];

    if (this.userIsAdmin()) {
      menuItems.push({
        routerLink: '/admin',
        iconClasses: 'fas fa-key',
        displayName: 'Administration'
      });
    }

    menuItems.push({
      routerLink: '/casing',
      iconClasses: 'fas fa-briefcase',
      displayName: 'Casing'
    });

    if (this.userCanUpload()) {
      menuItems.push({
        routerLink: '/data-upload',
        iconClasses: 'fas fa-upload',
        displayName: 'Data Upload'
      });
    }

    if (this.userCanExtract()) {
      menuItems.push({
        routerLink: '/extraction',
        iconClasses: 'fas fa-download',
        displayName: 'Data Extraction'
      });
    }

    if (this.userCanReport()) {
      menuItems.push({
        routerLink: '/reports',
        iconClasses: 'fas fa-newspaper',
        displayName: 'Reports'
      });
    }

    if (this.userIsBroker()) {
      menuItems.push({
        routerLink: '/brokerage',
        iconClasses: 'fas fa-building',
        displayName: 'Brokerage'
      });
    }

    menuItems.push({
      routerLink: '/geocoding',
      iconClasses: 'fas fa-globe-americas',
      displayName: 'Geocoding'
    });

    return menuItems;
  }

  signIn() {
    this.auth.signIn();
  }

  userIsAdmin(): boolean {
    if (this.auth.sessionUser && this.auth.sessionUser.role) {
      return this.auth.sessionUser.role.displayName.toLowerCase().includes('admin');
    } else {
      return false;
    }
  }

  // If Admin or group includes words 'support' or 'analyst'
  userCanExtract(): boolean {
    if (this.auth.sessionUser && this.auth.sessionUser.group) {
      const groupName = this.auth.sessionUser.group.displayName.toLowerCase();
      return groupName.includes('support') || groupName.includes('analyst') || this.userIsAdmin();
    }
    return this.userIsAdmin();
  }

  // If Admin or group includes words 'support' or 'analyst'
  userCanUpload(): boolean {
    if (this.auth.sessionUser && this.auth.sessionUser.group) {
      const groupName = this.auth.sessionUser.group.displayName.toLowerCase();
      return groupName.includes('support') || this.userIsAdmin();
    }
    return this.userIsAdmin();
  }

  // If Admin or group includes word 'support'
  userIsSupport(): boolean {
    if (this.auth.sessionUser && this.auth.sessionUser.group) {
      return this.auth.sessionUser.group.displayName.toLowerCase().includes('support') || this.userIsAdmin();
    }
    return this.userIsAdmin();
  }

  // For now, only allow admins to report.
  userCanReport(): boolean {
    return this.userCanExtract();
  }

  // For now, only allow admins to see broker stuff
  userIsBroker(): boolean {
    if (this.auth.sessionUser && this.auth.sessionUser.role) {
      return this.auth.sessionUser.role.displayName.toLowerCase().includes('admin');
    }
    return false;
  }

}
