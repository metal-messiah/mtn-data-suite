import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'mds-sitenav-stores-on-map',
  templateUrl: './sidenav-stores-on-map.component.html',
  styleUrls: ['./sidenav-stores-on-map.component.css']
})
export class SidenavStoresOnMapComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['casing'], {skipLocationChange: true});
  }

}
