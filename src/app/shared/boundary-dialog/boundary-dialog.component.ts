

import { Component, Inject, OnInit } from '@angular/core';
import { BoundaryDialogService } from './boundary-dialog.service';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'mds-boundary-dialog',
  templateUrl: './boundary-dialog.component.html',
  styleUrls: ['./boundary-dialog.component.css']
})
export class BoundaryDialogComponent implements OnInit {

  tabs = { PROJECT: 0, GEOPOLITICAL: 1, CUSTOM: 2 };
  gmap: google.maps.Map;

  constructor(private boundaryDialogService: BoundaryDialogService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    if (data.map) {
      this.boundaryDialogService.setMap(data.map)
    } else {
      console.error('NO MAP PROVIDED TO BOUNDARY DIALOG COMPONENT!')
    }
  }

  ngOnInit() { }

  edit(boundary, event) {
    event.preventDefault();
  }

  get enabledProjectBoundaries() {
    return this.boundaryDialogService.enabledProjectBoundaries;
  }
  set enabledProjectBoundaries(data) {
    this.boundaryDialogService.setEnabledProjectBoundaries(data);
  }

  get enabledGeoPoliticalBoundaries() {
    return this.boundaryDialogService.enabledGeoPoliticalBoundaries;
  }
  set enabledGeoPoliticalBoundaries(data) {
    this.boundaryDialogService.setEnabledGeoPoliticalBoundaries(data);
  }

  get enabledCustomBoundaries() {
    return this.boundaryDialogService.enabledCustomBoundaries;
  }
  set enabledCustomBoundaries(data) {
    this.boundaryDialogService.setEnabledCustomBoundaries(data);
  }

  get projectBoundaries() {
    return this.boundaryDialogService.projectBoundaries;
  }
  get geoPoliticalBoundaries() {
    return this.boundaryDialogService.geoPoliticalBoundaries;
  }
  get customBoundaries() {
    return this.boundaryDialogService.customBoundaries;
  }
}
