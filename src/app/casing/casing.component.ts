import { Component, OnInit } from '@angular/core';
import { CasingDashboardService } from './casing-dashboard/casing-dashboard.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mds-casing',
  templateUrl: './casing.component.html',
  styleUrls: ['./casing.component.css']
})
export class CasingComponent implements OnInit {

  constructor(public casingDashboardService: CasingDashboardService,
              private route: ActivatedRoute) { }

  ngOnInit() {
  }

  navigateToProjectSummary() {
    // TODO
  }

  navigateToProjectDetail() {
    // TODO
  }
}
