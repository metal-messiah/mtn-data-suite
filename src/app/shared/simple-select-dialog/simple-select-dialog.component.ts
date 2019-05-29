import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'mds-simple-select-dialog',
  templateUrl: './simple-select-dialog.component.html',
  styleUrls: ['./simple-select-dialog.component.css']
})
export class SimpleSelectDialogComponent implements OnInit {

  title = 'Select item';
  items;

  getDisplayText = (i) => i.toString();

  constructor(private dialogRef: MatDialogRef<SimpleSelectDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data) {
    this.items = data.items;
    if (data.items) {
      this.title = data.title;
    }
    if (data.getDisplayText) {
      this.getDisplayText = data.getDisplayText;
    }
  }

  ngOnInit() {
  }

  selectItem(item) {
    this.dialogRef.close(item);
  }

}
