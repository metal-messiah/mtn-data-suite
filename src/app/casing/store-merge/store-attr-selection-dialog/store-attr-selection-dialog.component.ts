import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {ErrorDialogComponent} from '../../../shared/error-dialog/error-dialog.component';
import {Store} from '../../../models/full/store';
import {of} from 'rxjs';
import {delay} from 'rxjs/operators';

@Component({
  selector: 'mds-store-attr-selection-dialog',
  templateUrl: './store-attr-selection-dialog.component.html',
  styleUrls: ['./store-attr-selection-dialog.component.css']
})
export class StoreAttrSelectionDialogComponent implements OnInit {

  merging = false;
  mergedStore;
  storeAttrNames: string[] = [
    'storeName',
    'storeNumber',
    'storeType',
    'dateOpened',
    'dateClosed',
    'fit',
    'format',
    'areaSales',
    'areaSalesPercentOfTotal',
    'areaTotal',
    'areaIsEstimate',
    'storeIsOpen24',
    'naturalFoodsAreIntegrated',
    'floating',
    'legacyLocationId',
    'validatedDate',
    'validatedBy',
    'banner',
    'currentStoreStatus',
    'currentStoreSurvey',
    'storeCasings',
    'models',
    'storeVolumes',
    'storeStatuses'
  ];

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { selectedStores: Store[] },
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.initializedMergedStore();
  }

  initializedMergedStore() {
    this.mergedStore = {
      storeName: this.storesHaveDifference('storeName'),
      storeNumber: this.storesHaveDifference('storeNumber')
    }
  }

  storesHaveDifference(attr: string) {
    const items = [this.data.selectedStores];
    for (let i = 0; i < items.length; i++) {
      const storei = items[i];
      for (let j = 0; j < items.length; j++) {
        const storej = items[j];
        if (storei !== storej && storei[attr] !== storej[attr]) {
          return true;
        }
      }
    }
    return false;
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  mergeStore() {
    this.merging = true;
    return of(1).pipe(delay(2000))
  }


  // mergeStores(): void {
  //   this.merging = true;
  //   this.storeService.mergeStore([store], this.mergedStore)
  //     .pipe(finalize(() => this.merging = false))
  //     .subscribe(() => {
  //       const message = `Successfully merged`;
  //       this.snackBar.open(message, null, {duration: 2000});
  //     }, err => this.errorService.handleServerError('Failed to merge!', err,
  //       () => console.log(err)));
  // }

}
