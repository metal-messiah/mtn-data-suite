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

  output: string[][];

  file: File;
  headerRow: string[];

  running = false;

  length = 0;

  offset = 0; // ms -- used for smoothness in rendering the progress bar

  newestResourceQuota: ResourceQuota;

  status: {
    done: number;
    total: number;
    successes: number;
    failures: number;
  } = {
    done: 0,
    total: 0,
    successes: 0,
    failures: 0
  };

  constructor(private geocodingService: GeocodingService) {
    // used to trigger loading bar
    this.geocodingService.running$.subscribe((data: boolean) => {
      this.running = data;
      if (!data) {
        this.offset = 0;
      }
    });

    // Could be implemented for table previews
    // this.geocodingService.output$.subscribe(
    //   data => (this.output = data.map(row => row.split(",")))
    // );

    // used to update the progress bar status and caption
    this.geocodingService.progress$.subscribe(
      (data: {
        done: number;
        total: number;
        successes: number;
        failures: number;
      }) => {
        this.offset += 10;
        setTimeout(() => {
          this.status.done = data.done;
          this.status.total = data.total;
          this.status.successes = data.successes;
          this.status.failures = data.failures;
        }, this.offset);
      }
    );

    this.geocodingService.resourceQuota$.subscribe((rq: ResourceQuota) => {
      this.newestResourceQuota = rq;
    });
  }

  ngOnInit() {}

  getStatus() {
    return (this.status.done / this.status.total) * 100;
  }

  disableField(form, targetInput, optionValue) {
    const inputs = ['addressField', 'cityField', 'stateField', 'zipField'];
    const checks = inputs.filter(i => i !== targetInput);
    let disable = false;
    checks.forEach(input => {
      if (form.value[input] === optionValue) {
        disable = true;
      }
    });
    return disable;
  }

  validateForm(form) {
    const { addressField, cityField, stateField, zipField } = form.value;
    return addressField || cityField || stateField || zipField || false;
  }

  estimateQuality(form) {
    const { addressField, cityField, stateField, zipField } = form.value;

    if (
      (addressField && cityField && stateField) ||
      (addressField && zipField)
    ) {
      return 'Rooftop';
    } else if (zipField || (cityField && stateField)) {
      return 'Centroid';
    } else {
      return 'Estimation';
    }
  }

  getQueryPreview(form) {
    const { addressField, cityField, stateField, zipField } = form.value;
    return this.geocodingService.getQueryStringPreview(
      this.file,
      addressField,
      cityField,
      stateField,
      zipField
    );
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
