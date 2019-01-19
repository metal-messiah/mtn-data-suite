import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '../../../models/full/store';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { ErrorDialogComponent } from '../../../shared/error-dialog/error-dialog.component';
import { StoreAttrSelectionDialogComponent } from '../store-attr-selection-dialog/store-attr-selection-dialog.component';
import { ErrorService } from '../../../core/services/error.service';
import { Location } from '@angular/common';

@Component({
  selector: 'mds-store-selection-dialog',
  templateUrl: './store-selection-dialog.component.html',
  styleUrls: ['./store-selection-dialog.component.css']
})
export class StoreSelectionDialogComponent implements OnInit {

  error: string;
  storeAttrNames: Store;

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject (MAT_DIALOG_DATA) public data: {stores: Store[] },
              private dialog: MatDialog,
              private errorService: ErrorService,
              private _location: Location) {
  }

  ngOnInit() {
  }

  // Auto selects any Store attribute that isn't null in the radio buttons

  // getStoreValue(attr: string) {
  //   if (this.data.stores[attr] === this.data.stores[attr]) {
  //     return this.data.stores[attr];
  //   } else {
  //     if (this.data.stores[attr] != null) {
  //       return this.data.stores[attr];
  //     } else {
  //       return this.data.stores[attr];
  //     }
  //   }
  // }

  goBack() {
    this.dialog.closeAll();
  };

  openStoreAttrMergeDialog() {
    this.dialog.open(StoreAttrSelectionDialogComponent, {
      maxWidth: '90%'
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }


}
