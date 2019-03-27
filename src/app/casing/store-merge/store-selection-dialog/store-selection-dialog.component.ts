import { Component, Inject } from '@angular/core';
import { Store } from '../../../models/full/store';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ErrorDialogComponent } from '../../../shared/error-dialog/error-dialog.component';

@Component({
  selector: 'mds-store-selection-dialog',
  templateUrl: './store-selection-dialog.component.html',
  styleUrls: ['./store-selection-dialog.component.css']
})
export class StoreSelectionDialogComponent {

  selectedStores: Store[] = [];

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject (MAT_DIALOG_DATA) public data: { stores: Store[] }) {
  }

  openStoreAttrMergeDialog() {
    this.dialogRef.close(this.selectedStores);
  }
}
