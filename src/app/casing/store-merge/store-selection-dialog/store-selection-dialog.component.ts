import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '../../../models/full/store';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { ErrorDialogComponent } from '../../../shared/error-dialog/error-dialog.component';
import { StoreAttrSelectionDialogComponent } from '../store-attr-selection-dialog/store-attr-selection-dialog.component';
import { StoreService } from '../../../core/services/store.service';
import { Site } from '../../../models/full/site';

@Component({
  selector: 'mds-store-selection-dialog',
  templateUrl: './store-selection-dialog.component.html',
  styleUrls: ['./store-selection-dialog.component.css']
})
export class StoreSelectionDialogComponent implements OnInit {

  //  duplicateStoreId: number[];
  siteId: Site;
  storeA: number;
  storeB: number;
  store: Store;
  stores: Store[];
  mergedStore;
  storeAttrNames: string[] = [
    'storeName',
    'storeNumber'
  ];

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject (MAT_DIALOG_DATA) public data: { store: Store },
              private dialog: MatDialog,
              private storeService: StoreService
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.storeService.getAllByIds(ids).subscribe( (stores: Store[]) => {
      this.stores = stores;
      this.storeService.getAllByIds(this.storeB).subscribe( (storeB: Store) => {
        this.store = storeB;
        this.initializedMergedStore();
      });
    });
  }

  initializedMergedStore() {
    this.mergedStore = {
      storeName: this.getStoreValue( 'storeName'),
      storeNumber: this.getStoreValue( 'storeNumber')
    };
  }

  // Auto selects any Store attribute that isn't null in the radio buttons
  getStoreValue(attr: string) {
    if (this.storeA[attr] === this.storeB[attr]) {
      return this.storeA[attr];
    } else {
      if (this.storeB[attr] != null) {
        return this.storeA[attr];
      } else {
        return this.storeA[attr];
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
