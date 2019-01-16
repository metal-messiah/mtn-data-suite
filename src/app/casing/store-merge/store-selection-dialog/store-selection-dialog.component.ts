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

  //  duplicateStoreId: number[];
  store = Store;
  stores: Store[];
  selectedStore: Store;
  mergedStore;
  selectedStoreAttrNames: string[] = [
    'storeName',
    'storeNumber'
  ];

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject (MAT_DIALOG_DATA) public data: { store: Store },
              private dialog: MatDialog
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
  }

  initializedMergedStore() {
    this.mergedStore = {
      storeName: this.getStoreValue( 'storeName'),
      storeNumber: this.getStoreValue( 'storeNumber')
    };
  }

  // Auto selects any Store attribute that isn't null in the radio buttons
  getStoreValue(attr: string) {
    if (this.selectedStore[attr] === this.selectedStore[attr]) {
      return this.selectedStore[0][attr];
    } else {
      if (this.selectedStore[][attr] != null) {
        return this.selectedStore[][attr];
      } else {
        return this.selectedStore[][attr];
      }
    }
  }


  openStoreAttrMergeDialog() {
    this.dialog.open(StoreAttrSelectionDialogComponent, {
      maxWidth: '90%'
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }



}
