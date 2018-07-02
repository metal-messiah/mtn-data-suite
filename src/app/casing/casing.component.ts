import { Component, OnInit } from '@angular/core';
import { CasingDashboardService } from './casing-dashboard/casing-dashboard.service';

@Component({
  selector: 'mds-casing',
  templateUrl: './casing.component.html',
  styleUrls: ['./casing.component.css']
})
export class CasingComponent implements OnInit {

  constructor(public casingDashboardService: CasingDashboardService) { }

  ngOnInit() {
  }

  navigateToProjectSummary() {
    // TODO
  }

  navigateToProjectDetail() {
    // TODO
  }
}
