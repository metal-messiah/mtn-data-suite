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

  error: string;
  mergedStore;
  store1: Store;
  store2: Store;
  storeAttrNames: string[] = [
    'storeName',
    'storeNumber'
  ];
  selectedStores: Store[];

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject (MAT_DIALOG_DATA) public data: {stores: Store[] },
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.selectedStores = this.data.stores;
    this.initializedMergedStore();
  }

  initializedMergedStore() {
    this.mergedStore = {
      storeName: this.checkStoreValues( 'storeName'),
      storeNumber: this.checkStoreValues('storeNumber')
    }
  }

  checkStoreValues(attr: string) {
    const items = [this.data.stores];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      for (let j = 0; j <items.length; j++) {
        const checkedStores = items[j];
      }
    }
  }

  goBack() {
    this.dialog.closeAll();
  };

  openStoreAttrMergeDialog(selectedStores: Store[]) {
    this.dialogRef.close();
    this.dialog.open(StoreAttrSelectionDialogComponent, {
      maxWidth: '90%',
      data: {selectedStores: selectedStores}
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
