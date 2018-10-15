import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { SpreadsheetService } from '../spreadsheet.service';

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
  assignments: { name: string; lat: string; lng: string };
  csvAsText: string;

  sendingData = false;

  MatDialog;
  constructor(
    public dialogRef: MatDialogRef<AssignFieldsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(data);
    this.fields = data.fields;
    console.log(this.fields);
    this.spreadsheetService = data.spreadsheetService;
    this.assignments = { name: '', lat: '', lng: '' };
    this.csvAsText = data.csvAsText;
    this.sendingData = false;
  }

  ngOnInit() {}

  changeValue(field, val) {
    // console.log(field, val);
    this.assignments[field] = val;
  }

  assignFields(form) {
    // console.log(form);
    if (form.valid) {
      this.sendingData = true;
      this.spreadsheetService.assignFields(this.fields, this.assignments);
      this.dialogRef.close();
    }
  }
}
