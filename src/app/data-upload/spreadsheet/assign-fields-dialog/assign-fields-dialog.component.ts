import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatStepper } from '@angular/material';
import { SpreadsheetService } from '../spreadsheet.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { FieldMappingItem } from './field-mapping-item';

@Component({
  selector: 'mds-assign-fields-dialog',
  templateUrl: './assign-fields-dialog.component.html',
  styleUrls: ['./assign-fields-dialog.component.css'],
  providers: []
})
export class AssignFieldsDialogComponent implements OnInit {
  title = 'Assign Fields';
  fields: string[];
  spreadsheetService: SpreadsheetService;

  form: FormGroup;

  csvAsText: string;

  sendingData = false;

  matchType: string;

  updateItems: FieldMappingItem[];

  @ViewChild('stepper')
  stepper: MatStepper;

  MatDialog;
  constructor(
    public dialogRef: MatDialogRef<AssignFieldsDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(data);
    this.fields = data.fields;
    console.log(this.fields);
    this.spreadsheetService = data.spreadsheetService;

    this.updateItems = [];

    this.csvAsText = data.csvAsText;
    this.sendingData = false;
  }

  ngOnInit() {
    this.createForm();
  }

  private createForm() {
    this.form = this.fb.group({
      name: '',
      lat: '',
      lng: '',
      company: '',
      storeNumber: '',
      matchType: 'location',
      updateFields: []
    });
  }

  // changeValue(field, val) {
  //   // console.log(field, val);
  //   this.assignments[field] = val;
  // }

  assignFields(form) {
    // console.log(form);
    if (form.valid) {
      this.sendingData = true;
      this.spreadsheetService.assignFields(this.fields, this.form.value);
      this.dialogRef.close();
    }
  }

  updateItemsAreValid() {
    let isValid = true;
    this.updateItems.forEach(i => {
      if (!i.selectedFileField || !i.selectedStoreField) {
        isValid = false;
      }
    });
    if (isValid) {
      this.mapUpdateItemsToForm();
    }
    return isValid;
  }

  mapUpdateItemsToForm() {
    this.form.value.updateFields = this.updateItems.map(i => {
      return { file: i.selectedFileField, store: i.selectedStoreField };
    });
  }

  updateSelectedFileField(id, val) {
    const idx = this.updateItems.findIndex(item => item.id === id);
    this.updateItems[idx].selectedFileField = val;
    console.log(this.updateItems);
  }

  updateSelectedStoreField(id, val) {
    const idx = this.updateItems.findIndex(item => item.id === id);
    this.updateItems[idx].selectedStoreField = val;
    console.log(this.updateItems);
  }

  addFieldMappingItem() {
    this.updateItems.push(new FieldMappingItem(this.fields));
  }

  formIsValid(step) {
    const { controls, value } = this.form;
    if (step === 2) {
      if (value.matchType === 'location') {
        return controls.name.valid && controls.lat.valid && controls.lng.valid;
      }
      if (value.matchType === 'storeNumber') {
        return controls.company.valid && controls.storeNumber.valid;
      }
    }
    if (step === 3) {
      return this.updateItems.length > 0 && this.updateItemsAreValid();
    }
  }

  goForward() {
    console.log(this.form);
    this.stepper.next();
  }

  goBackward() {
    this.stepper.reset();
  }
}
