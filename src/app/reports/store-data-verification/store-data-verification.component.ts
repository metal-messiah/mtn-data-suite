import { Component, OnInit } from '@angular/core';
import { ReportBuilderService } from '../services/report-builder.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { StoreService } from '../../core/services/store.service';
import { StoreListItem } from '../../models/store-list-item';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'mds-store-data-verification',
  templateUrl: './store-data-verification.component.html',
  styleUrls: ['./store-data-verification.component.css']
})
export class StoreDataVerificationComponent implements OnInit {

  form: FormGroup;

  origin: string;

  constructor(private rbs: ReportBuilderService,
              public _location: Location,
              public router: Router,
              private snackBar: MatSnackBar,
              private storeService: StoreService,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    if (!this.rbs.reportTableData) {
      this.snackBar.open('No data has been loaded. Starting from the beginning', null, {duration: 5000});
      this.router.navigate(['reports']);
    } else {
      this.origin = location.origin;
      this.createForm();
    }
  }

  createForm() {
    this.form = this.fb.group({
      stores: this.fb.array(this.rbs.reportTableData.storeList
        .filter(s => s.category !== 'Do Not Include')
        .map(si => {
          const group = this.fb.group(si);
          group.get('totalArea').setValidators([Validators.required]);
          return group;
        }))
    });
  }

  next() {
    (this.form.get('stores') as FormArray).controls.forEach(siControl => {
      const totalAreaControl = siControl.get('totalArea');
      if (totalAreaControl.dirty) {
        const mapKey = siControl.get('mapKey').value;
        const storeListItem: StoreListItem = this.rbs.reportTableData.storeList.find(s => s.mapKey === mapKey);
        storeListItem.totalArea = totalAreaControl.value;
      }
    });

    this.router.navigate(['reports/site-evaluation'])
  }

}
