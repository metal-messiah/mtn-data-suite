import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MapService } from 'app/core/services/map.service';

@Component({
  selector: 'mds-map-dialog',
  templateUrl: './map-dialog.component.html',
  styleUrls: ['./map-dialog.component.css']
})
export class MapDialogComponent implements OnInit {

  constructor(private mapService: MapService, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
  }

  onMapReady() {
    console.log("dialog map is ready!");
  }

}
