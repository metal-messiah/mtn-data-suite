import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { ErrorDialogComponent } from '../../../shared/error-dialog/error-dialog.component';
import { Store } from '../../../models/full/store';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';

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
    displayName: 'Store Name',
    show: false
  }, {
    attrName: 'storeNumber',
    displayName: 'Store Number',
    show: false
  }, {
    attrName: 'storeType',
    displayName: 'Store Type',
    show: false
  }, {
    attrName: 'dateOpened',
    displayName: 'Date Opened',
    show: false
  }, {
    attrName: 'dateClosed',
    displayName: 'Date Closed',
    show: false
  }, {
    attrName: 'fit',
    displayName: 'Fit',
    show: false
  }, {
    attrName: 'format',
    displayName: 'Format',
    show: false
  }, {
    attrName: 'areaSales',
    displayName: 'Sales Area',
    show: false
  }, {
    attrName: 'areaSalesPercentOfTotal',
    displayName: '% of Total Sales Area',
    show: false
  }, {
    attrName: 'areaTotal',
    displayName: 'Total Area',
    show: false
  }, {
    attrName: 'areaIsEstimate',
    displayName: 'Area Is Estimate',
    show: false
  }, {
    attrName: 'storeIsOpen24',
    displayName: 'Open 24 Hours',
    show: false
  }, {
    attrName: 'naturalFoodsAreIntegrated',
    displayName: 'Natural Foods Integrated',
    show: false
  }, {
    attrName: 'floating',
    displayName: 'Floating',
    show: false
  }];
  selectedStoreBanner = [{
    attrName: 'banner',
    displayName: 'Banner',
    show: false
  }];

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { selectedStores: Store[] },
              private dialog: MatDialog) {
  }

  ngOnInit() {
    // TODO I'm not sure why I'm even waiting to get banner, I don't remember the conditions of waiting, and it's crucial to know so I can program it accordingly.
    // this.mergedStore.getBanners.subscribe( () => {
    //   console.log('Banner\'s retrieved');
    // })
    this.initializedMergedStore()
  }

  initializedMergedStore() {
    this.mergedStore = new Store(this.data.selectedStores[0]);
    if (this.storeAttrNames != null) {
      this.storeAttrNames.forEach(attr => {
        if (this.storesHaveDifference(attr.attrName)) {
          attr.show = true;
        }
      });
      console.log(this.data.selectedStores);
    }
  }

  // TODO Delete this if I find a better way to incorporate it into the initializedMergedStore function
  getBanners() {
    this.mergedStore = new Store(this.data.selectedStores[0]);
    this.data.selectedStores;
    if (this.selectedStoreBanner != null) {
      this.selectedStoreBanner.forEach( attr => {
        if (this.storesHaveDifference(attr.attrName)) {
          attr.show = true;
        }
      });
      console.log(this.data.selectedStores);
    }
  }

  storesHaveDifference(attr: string) {
    for (let i = 0; i < this.data.selectedStores.length; i++) {
      const storei = this.data.selectedStores[i];
      for (let j = 0; j < this.data.selectedStores.length; j++) {
        const storej = this.data.selectedStores[j];
        const attrNotEqual = storei[attr] !== storej[attr];
        if (storei !== storej && attrNotEqual) {
          return true;
        }
      }
    }
    return false;
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  mergeStores() {
    this.merging = true;
    return of(1).pipe(delay(2000))
  }

  // mergeStores(): void {
  //   this.merging = true;
  //   this.storeService.mergedStore(this.selectedStores, this.mergedStore)
  //     .pipe(finalize(() => this.merging = false))
  //     .subscribe(() => {
  //       const message = `Successfully merged`;
  //       this.snackBar.open(message, null, {duration: 2000});
  //     }, err => this.errorService.handleServerError('Failed to merge!', err,
  //       () => console.log(err)));
  // }
}
