import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { StoreService } from '../../core/services/store.service';
import { ErrorService } from '../../core/services/error.service';
import { Store } from '../../models/full/store';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'mds-store-merge-dialog',
  templateUrl: './store-merge-dialog.component.html',
  styleUrls: ['./store-merge-dialog.component.css']
})
export class StoreMergeDialogComponent implements OnInit {

  storeId: number;
  duplicateStoreId: number;
  store1: Store;
  store2: Store;
  mergedStore;
  merging = false;
  storeAttrNames: string[] = [
    'storeName',
    'storeNumber,',
    'storeType',
    'dateOpened,',
    'dateClosed,',
    'fit',
    'format',
    'areaSales',
    'areaSalesPercentOfTotal',
    'areaTotal',
    'areaIsEstimate',
    'storeIsOpen24'
  ];

  constructor(public dialogRef: MatDialogRef<StoreMergeDialogComponent>,
              @Inject(MAT_DIALOG_DATA)
              public data: any,
              private storeService: StoreService,
              private snackBar: MatSnackBar,
              private errorService: ErrorService
  ) {
    this.storeId = data.selectedStoreId;
    this.duplicateStoreId = data.duplicateStoreId;
  }

  ngOnInit() {
    this.storeService.getOneById(this.storeId).subscribe((store1: Store) => {
      this.store1 = store1;
      this.storeService.getOneById(this.duplicateStoreId).subscribe((store2: Store) => {
        this.store2 = store2;
        this.initializedMergedStore()
      });
    });
  }

  initializedMergedStore() {
    this.mergedStore = {
      storeName: this.getStoreValue('storeName'),
      storeNumber: this.getStoreValue('storeNumber'),
      storeType: this.getStoreValue('storeType'),
      dateOpened: this.getStoreValue('dateOpened'),
      dateClosed: this.getStoreValue('dateClosed'),
      fit: this.getStoreValue('fit'),
      format: this.getStoreValue('format'),
      areaSales: this.getStoreValue('areaSales'),
      areaSalesPercentOfTotal: this.getStoreValue('areaSalesPercentOfTotal'),
      areaTotal: this.getStoreValue('areaTotal'),
      areaIsEstimate: this.getStoreValue('areaIsEstimate'),
      storeIsOpen24: this.getStoreValue('storeIsOpen24')
    }
  };

  // Auto Select Store attribute if not null
  getStoreValue(attr: string) {
    if (this.store1[attr] === this.store2[attr]) {
      return this.store1[attr];
    } else {
      if (this.store1[attr] != null) {
        return this.store1[attr];
      } else {
        return this.store2[attr];
      }
    }
  }

  mergeStores(): void {
    this.merging = true;
    this.storeService.mergeStore(this.store1, this.store2, this.mergedStore)
      .pipe(finalize(() => this.merging = false))
      .subscribe(() => {
          const message = 'Successfully merged';
          this.snackBar.open(message, null, {duration: 2000});
        }, err => this.errorService.handleServerError('Failed to merge!', err,
        () => console.log(err))
      )
  }
}
