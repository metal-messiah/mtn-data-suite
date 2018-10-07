import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'mds-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(public auth: AuthService) { }

  ngOnInit() {
    console.log(environment.VERSION);
  }

  userIsAdmin(): boolean {
    const role = this.auth.sessionUser.role;
    if (role != null) {
      return role.displayName.toLowerCase().includes('admin');
    }
    return false;
  }

  // If Admin or group includes words 'support' or 'analyst'
  userCanExtract(): boolean {
    const group = this.auth.sessionUser.group;
    if (group != null) {
      const groupName = group.displayName.toLowerCase();
      return groupName.includes('support') || groupName.includes('analyst') || this.userIsAdmin();
    }
    return this.userIsAdmin();
  }

  // If Admin or group includes words 'support' or 'analyst'
  userCanUpload(): boolean {
    const group = this.auth.sessionUser.group;
    if (group != null) {
      const groupName = group.displayName.toLowerCase();
      return groupName.includes('support') || this.userIsAdmin();
    }
    return this.userIsAdmin();
  }

  // If Admin or group includes word 'support'
  userIsSupport(): boolean {
    const group = this.auth.sessionUser.group;
    if (group != null) {
      return group.displayName.toLowerCase().includes('support') || this.userIsAdmin();
    }
    return this.userIsAdmin();
  }

  // For now, only allow admins to report.
  userCanReport(): boolean {
    return this.userCanExtract();
  }

}
