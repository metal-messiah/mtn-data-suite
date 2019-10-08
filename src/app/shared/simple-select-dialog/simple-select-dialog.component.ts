import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'mds-simple-select-dialog',
  templateUrl: './simple-select-dialog.component.html',
  styleUrls: ['./simple-select-dialog.component.css']
})
export class SimpleSelectDialogComponent implements OnInit {
  title = 'Select item';
  items: any[];

  itemsDisplay: any[];
  sortField: string;

  fuzzyFields: string[] = [];

  getDisplayText = i => i.toString();

  constructor(private dialogRef: MatDialogRef<SimpleSelectDialogComponent>, @Inject(MAT_DIALOG_DATA) private data) {
    this.items = data.items;
    this.fuzzyFields = Object.keys(this.items.length ? this.items[0] : []);
    this.sortField = data.sortField;
    this.sortAlphabetically(this.items, this.sortField);
    this.itemsDisplay = this.items;
    if (data.items) {
      this.title = data.title;
    }
    if (data.getDisplayText) {
      this.getDisplayText = data.getDisplayText;
    }
  }

  ngOnInit() {}

  selectItem(item) {
    this.dialogRef.close(item);
  }

  sortAlphabetically(array: any[], property: string) {
    array.sort((a, b) => {
      if (a[property] > b[property]) {
        return 1;
      }
      if (a[property] < b[property]) {
        return -1;
      }
      return 0;
    });
  }

  handleFuzzySearch(output: [any[], string]) {
    const [results, term] = output;
    this.itemsDisplay = term ? results : this.items;
    this.sortAlphabetically(this.itemsDisplay, this.sortField);
  }
}
