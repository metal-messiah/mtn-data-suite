import { Component, OnInit } from '@angular/core';
import { ReportBuilderService } from '../services/report-builder.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'mds-store-data-verification',
  templateUrl: './store-data-verification.component.html',
  styleUrls: ['./store-data-verification.component.css']
})
export class StoreDataVerificationComponent implements OnInit {

  form: FormGroup;

  origin: string;

  constructor(public rbs: ReportBuilderService,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.origin = location.origin;
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      stores: this.fb.array(this.rbs.reportTableData.storeList.map(si => this.fb.group(si)))
    });
  }

}
