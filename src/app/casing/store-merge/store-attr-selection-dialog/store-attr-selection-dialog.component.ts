import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorDialogComponent } from '../../../shared/error-dialog/error-dialog.component';
import { Store } from '../../../models/full/store';
import { finalize } from 'rxjs/operators';
import { StoreService } from '../../../core/services/store.service';
import { ErrorService } from '../../../core/services/error.service';

@Component({
  selector: 'mds-store-attr-selection-dialog',
  templateUrl: './store-attr-selection-dialog.component.html',
  styleUrls: ['./store-attr-selection-dialog.component.css']
})
export class StoreAttrSelectionDialogComponent implements OnInit {

  merging = false;
  mergedStore;
  storeAttributes = [
    {
      attrName: 'storeName',
      displayName: 'Store Name'
    },
    {
      attrName: 'storeNumber',
      displayName: 'Store Number'
    },
    {
      attrName: 'storeType',
      displayName: 'Store Type'
    },
    {
      attrName: 'dateOpened',
      displayName: 'Date Opened'
    },
    {
      attrName: 'dateClosed',
      displayName: 'Date Closed'
    },
    {
      attrName: 'fit',
      displayName: 'Fit'
    },
    {
      attrName: 'format',
      displayName: 'Format'
    },
    {
      attrName: 'areaSales',
      displayName: 'Sales Area'
    },
    {
      attrName: 'areaSalesPercentOfTotal',
      displayName: '% of Total Sales Area'
    },
    {
      attrName: 'areaTotal',
      displayName: 'Total Area'
    },
    {
      attrName: 'areaIsEstimate',
      displayName: 'Area Is Estimate'
    },
    {
      attrName: 'storeIsOpen24',
      displayName: 'Open 24 Hours'
    },
    {
      attrName: 'naturalFoodsAreIntegrated',
      displayName: 'Natural Foods Integrated'
    },
    {
      attrName: 'floating',
      displayName: 'Floating'
    }
  ];

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { selectedStores: Store[] },
              private storeService: StoreService,
              private snackBar: MatSnackBar,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    // Create a copy of the first store for default values
    this.mergedStore = new Store(this.data.selectedStores[0]);
    this.mergedStore.banner = this.data.selectedStores[0].banner;

    // Then determine which attributes are unanimous
    this.storeAttributes.forEach(attr => {
      // Stores are unanimous if a unique Set of the values ends up with only 1 value
      attr['unanimous'] = new Set(this.data.selectedStores.map(s => s[attr.attrName])).size === 1;
    });
  }

  mergeStores(): void {
    this.merging = true;
    this.storeService.mergeStores(this.mergedStore, this.data.selectedStores.map(st => st.id))
      .pipe(finalize(() => this.merging = false))
      .subscribe((store: Store) => {
          this.snackBar.open('Successfully merged', null, {duration: 2000});
          this.dialogRef.close(store);
        },
        err => this.errorService.handleServerError('Failed to merge!', err, () => console.log(err))
      );
  }
}
