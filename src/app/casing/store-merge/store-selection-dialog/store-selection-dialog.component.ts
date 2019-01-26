import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '../../../models/full/store';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { ErrorDialogComponent } from '../../../shared/error-dialog/error-dialog.component';
import { StoreAttrSelectionDialogComponent } from '../store-attr-selection-dialog/store-attr-selection-dialog.component';

@Component({
  selector: 'mds-store-selection-dialog',
  templateUrl: './store-selection-dialog.component.html',
  styleUrls: ['./store-selection-dialog.component.css']
})
export class StoreSelectionDialogComponent implements OnInit {

  selectedStores: Store[] = [];

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject (MAT_DIALOG_DATA) public data: { stores: Store[] },
              private dialog: MatDialog) {
  }

  ngOnInit() {
  }

  openStoreAttrMergeDialog() {
    this.dialogRef.close();
    this.dialog.open(StoreAttrSelectionDialogComponent, {
      maxWidth: '90%',
      data: {selectedStores: this.selectedStores}
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
