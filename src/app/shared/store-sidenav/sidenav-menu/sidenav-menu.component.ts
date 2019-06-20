import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'mds-sidenav-menu',
  templateUrl: './sidenav-menu.component.html',
  styleUrls: ['./sidenav-menu.component.css']
})
export class SidenavMenuComponent implements OnInit {

  constructor(private router: Router,
              private storageService: StorageService) { }

  ngOnInit() {
    this.storageService.removeOne('casing-dashboard-store-list-view');
  }

  navigateTo(endpoint: string) {
    this.router.navigate(['casing', endpoint], {skipLocationChange: true});
  }

}
