import { Component, OnInit } from '@angular/core';

import { GeocodingService } from './geocoding.service';
import { ResourceQuota } from '../models/resource-quota';
import { ResourceQuotaService } from '../core/services/resource-quota.service';
import { subscribeOn } from 'rxjs/operators';
import { Pageable } from '../models/pageable';

@Component({
  selector: 'mds-geocoding',
  templateUrl: './geocoding.component.html',
  styleUrls: ['./geocoding.component.css'],
  providers: [GeocodingService, ResourceQuotaService]
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

  addressField: string;
  cityField: string;
  stateField: string;
  zipField: string;

  newestResourceQuota: ResourceQuota;

  status: { done: number; total: number; text: string } = {
    done: 0,
    total: 0,
    text: ''
  };

  constructor(
    private geocodingService: GeocodingService,
    private resourceQuotaService: ResourceQuotaService
  ) {
    this.geocodingService.running$.subscribe(data => (this.running = data));
    this.geocodingService.output$.subscribe(
      data => (this.output = data.map(row => row.split(',')))
    );
    this.geocodingService.progress$.subscribe(
      (data: { done: number; total: number; text: string }) => {
        this.status.done = data.done;
        this.status.total = data.total;
        this.status.text = data.text;
      }
    );

    this.getNewestResourceQuota();
  }

  ngOnInit() {}

  getStatus() {
    return (this.status.done / this.status.total) * 100;
  }

  getNewestResourceQuota() {
    this.resourceQuotaService.getNewest('GEOCODING').subscribe(
      (page: Pageable<ResourceQuota>) => {
        if (page.content.length) {
          this.newestResourceQuota = page.content[0];
        } else {
          this.newestResourceQuota = this.createNewResourceQuota();
        }
      },
      (err) => {
        console.error('ERROR GETTING LATEST RESOURCE QUOTA!',  err);
        this.newestResourceQuota = this.createNewResourceQuota();
      }
    );
  }

  createNewResourceQuota() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const rq = new ResourceQuota({
      resourceName: 'GEOCODING',
      periodStartDate: firstDay,
      queryCount: 0,
      quotaLimit: 20000
    });
    this.resourceQuotaService.create(rq);
    return rq;
  }

  handleFile(file) {
    this.file = file;
    this.headerRow = this.geocodingService.getHeaderRowArray(file);
    this.length = this.geocodingService.getRowLength(file);
    this.canGeocode = this.shouldGeocode();
    console.log('can geocode? ', this.canGeocode, this.newestResourceQuota);
  }

  differenceInDays(firstDate, secondDate) {
    return Math.round((secondDate - firstDate) / (1000 * 60 * 60 * 24));
  }

  shouldGeocode() {
    if (this.newestResourceQuota) {
      const rqStart = new Date(this.newestResourceQuota.periodStartDate);
      const now = new Date();
      const diff = this.differenceInDays(rqStart, now);
      if (diff > 31) {
        // older than a month
        this.createNewResourceQuota();
        return true;
      } else if (
        this.newestResourceQuota.queryCount + this.length <=
        this.newestResourceQuota.quotaLimit
      ) {
        return true;
      } else {
        return false;
      }
    }
  }

  submit(form) {
    const { addressField, cityField, stateField, zipField } = form.value;
    this.addressField = addressField;
    this.cityField = cityField;
    this.stateField = stateField;
    this.zipField = zipField;

    this.geocodingService.handleFile(
      this.file,
      this.addressField,
      this.cityField,
      this.stateField,
      this.zipField
    );
  }
}
