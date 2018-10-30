import { Component, OnInit } from '@angular/core';

import { GeocodingService } from './geocoding.service';
import { ResourceQuota } from '../models/resource-quota';

@Component({
  selector: 'mds-geocoding',
  templateUrl: './geocoding.component.html',
  styleUrls: ['./geocoding.component.css'],
  providers: [GeocodingService]
})
export class GeocodingComponent implements OnInit {
  canGeocode = false;

  finished: boolean;
  output: string[][];

  file: File;
  headerRow: string[];

  allowedFileTypes = '.csv';
  outputType = 'text';

  running = false;

  length = 0;

  newestResourceQuota: ResourceQuota;

  status: { done: number; total: number; text: string } = {
    done: 0,
    total: 0,
    text: ''
  };

  constructor(private geocodingService: GeocodingService) {
    // used to trigger loading bar
    this.geocodingService.running$.subscribe(
      (data: boolean) => (this.running = data)
    );

    // Could be implemented for table previews
    // this.geocodingService.output$.subscribe(
    //   data => (this.output = data.map(row => row.split(",")))
    // );

    // used to update the progress bar status and caption
    this.geocodingService.progress$.subscribe(
      (data: { done: number; total: number; text: string }) => {
        this.status.done = data.done;
        this.status.total = data.total;
        this.status.text = data.text;
      }
    );

    this.geocodingService.resourceQuota$.subscribe(
      (rq: ResourceQuota)=> {
        this.newestResourceQuota = rq;
      }
    )
  }

  ngOnInit() {}

  getStatus() {
    return (this.status.done / this.status.total) * 100;
  }

  handleFile(file) {
    this.geocodingService.reset();
    this.file = file;
    this.headerRow = this.geocodingService.getHeaderRowArray(file);
    this.length = this.geocodingService.getRowLength(file);
    this.canGeocode = this.geocodingService.shouldGeocode();
  }

  submit(form) {
    const { addressField, cityField, stateField, zipField } = form.value;

    this.geocodingService.handleFile(
      this.file,
      addressField,
      cityField,
      stateField,
      zipField
    );
  }
}
