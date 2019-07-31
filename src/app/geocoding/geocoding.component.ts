import { Component, OnDestroy, OnInit } from '@angular/core';

import { GeocodingService } from './geocoding.service';
import { ResourceQuota } from '../models/resource-quota';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mds-geocoding',
  templateUrl: './geocoding.component.html',
  styleUrls: ['./geocoding.component.css'],
  providers: [GeocodingService]
})
export class GeocodingComponent implements OnInit, OnDestroy {
  canGeocode = false;

  output: string[][];

  inputFile: File;
  headerRow: string[];

  running = false;

  length = 0;

  offset = 0; // ms -- used for smoothness in rendering the progress bar

  quota: ResourceQuota;

  status;

  fieldForm: FormGroup;

  private subscriptions: Subscription[];

  constructor(private geocodingService: GeocodingService,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.subscriptions = [];

    // used to trigger loading bar
    this.subscriptions.push(this.geocodingService.running$.subscribe((data: boolean) => {
      this.running = data;
      if (!data) {
        console.log('DONE RUNNING!');
        this.offset = 0;
      }
    }));

    // used to update the progress bar status and caption
    this.subscriptions.push(this.geocodingService.progress$.subscribe((data: {
        done: number;
        total: number;
        successes: number;
        failures: number;
        rooftops: number;
      }) => {
        this.offset += 10;
        setTimeout(() => {
          this.status.done = data.done;
          this.status.total = data.total;
          this.status.successes = data.successes;
          this.status.failures = data.failures;
          this.status.rooftops = data.rooftops;
        }, this.offset);
      }
    ));

    this.subscriptions.push(this.geocodingService.resourceQuota$.subscribe((rq: ResourceQuota) => this.quota = rq));

    this.resetStatus();

    this.buildForm();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  get address(): string {
    return this.fieldForm.get('address').value;
  }

  get city(): string {
    return this.fieldForm.get('city').value;
  }

  get state(): string {
    return this.fieldForm.get('state').value;
  }

  get zip(): string {
    return this.fieldForm.get('zip').value;
  }

  private resetStatus() {
    this.status = {
      done: 0,
      total: 0,
      successes: 0,
      failures: 0,
      rooftops: 0
    };
  }

  private oneRequiredValidator: ValidatorFn = (control: FormGroup): ValidationErrors => {
    const address = control.get('address').value;
    const city = control.get('city').value;
    const state = control.get('state').value;
    const zip = control.get('zip').value;
    return (address || city || state || zip) ? null : {'oneRequired': true};
  };

  private buildForm() {
    this.fieldForm = this.fb.group({
      address: null,
      city: null,
      state: null,
      zip: null
    }, {validators: this.oneRequiredValidator})
  }

  getStatus() {
    return (this.status.done / this.status.total) * 100;
  }

  disableField(targetInput, columnHeader) {
    const fields = ['address', 'city', 'state', 'zip'];
    const otherFields = fields.filter(i => i !== targetInput);
    // Returns true if any other field already has the column selected
    return otherFields.some(field => this.fieldForm.get(field).value === columnHeader);
  }

  estimateQuality() {
    if (
      (this.address && this.city && this.state) ||
      (this.address && this.zip)
    ) {
      return 'Rooftop';
    } else if (this.zip || (this.city && this.state)) {
      return 'Centroid';
    } else {
      return 'Estimation';
    }
  }

  getQualityColor() {
    const label = this.estimateQuality();
    return label === 'Rooftop'
      ? 'green'
      : label === 'Centroid'
        ? 'orange'
        : 'red';
  }

  getQueryPreview() {
    return this.geocodingService.getQueryStringPreview(
      this.inputFile,
      this.address,
      this.city,
      this.state,
      this.zip
    );
  }

  handleFile(file) {
    this.inputFile = file;

    // TODO MDS-543 Refactor to use papaParse
    this.headerRow = this.geocodingService.getHeaderRowArray(file);
    this.length = this.geocodingService.getRowLength(file);
    this.canGeocode = this.geocodingService.shouldGeocode();
  }

  submit() {
    // TODO MDS-544 Should return an observable with status object being emitted
    this.geocodingService.handleFile(
      this.inputFile,
      this.address,
      this.city,
      this.state,
      this.zip
    );
  }
}
