import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { ErrorDialogComponent } from '../../../shared/error-dialog/error-dialog.component';
import { Store } from '../../../models/full/store';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'mds-store-attr-selection-dialog',
  templateUrl: './store-attr-selection-dialog.component.html',
  styleUrls: ['./store-attr-selection-dialog.component.css']
})
export class StoreAttrSelectionDialogComponent implements OnInit {

  merging = false;
  mergedStore;
  storeAttrNames = [{
    attrName: 'storeName',
    displayName: 'Store Name'
  }, {
    attrName: 'storeNumber',
    displayName: 'Store Number'
  }, {
    attrName: 'storeType',
    displayName: 'Store Type'
  }, {
    attrName: 'dateOpened',
    displayName: 'Date Opened'
  }, {
    attrName: 'dateClosed',
    displayName: 'Date Closed'
  }, {
    attrName: 'fit',
    displayName: 'Fit'
  }, {
    attrName: 'format',
    displayName: 'Format'
  }, {
    attrName: 'areaSales',
    displayName: 'Sales Area'
  }, {
    attrName: 'areaSalesPercentOfTotal',
    displayName: '% of Total Sales Area'
  }, {
    attrName: 'areaTotal',
    displayName: 'Total Area'
  }, {
    attrName: 'areaIsEstimate',
    displayName: 'Area Is Estimate'
  }, {
    attrName: 'storeIsOpen24',
    displayName: 'Open 24 Hours'
  }, {
    attrName: 'naturalFoodsAreIntegrated',
    displayName: 'Natural Foods Integrated'
  }, {
    attrName: 'floating',
    displayName: 'Floating'
  }];
  storeAttrStatuses = [{
    attrName: 'banner',
    displayName: 'Banner'
  }, {
    attrName: 'currentStoreStatus',
    displayName: 'Current Store Status'
  }, {
    attrName: 'currentStoreSurvey',
    displayName: 'Current Store Survey'
  }, {
    attrName: 'storeCasings',
    displayName: 'Store Casings'
  }, {
    attrName: 'storeVolumes',
    displayName: 'Store Volumes'
  }, {
    attrName: 'storeStatuses',
    displayName: 'Store Statuses'
  }, {
    attrName: 'models',
    displayName: 'Models'
  }];

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { selectedStores: Store[] },
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.mergedStore = new Store(this.data.selectedStores);
    this.storeAttrNames.forEach(attr => this.mergedStore[attr.attrName] = this.storesHaveDifference(attr.attrName));
    this.storeAttrStatuses.forEach( attr => this.mergedStore[attr.attrName] = this.storesHaveDifference(attr.attrName));
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
