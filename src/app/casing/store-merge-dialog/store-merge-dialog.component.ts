import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Site } from '../../models/full/site';
import { of } from 'rxjs';
import { Store } from '../../models/full/store';

@Component({
  selector: 'mds-store-merge-dialog',
  templateUrl: './store-merge-dialog.component.html',
  styleUrls: ['./store-merge-dialog.component.css']
})

export class StoreMergeDialogComponent {

  site: Site;
  merging = false;
  page1;
  showing = true;
  selectedStores: number;
  duplicateStores: Store[];
  storeAttrNames: string[] = [
    'storeName',
    'storeNumber',
    'storeType',
    'dateOpened',
    'dateClosed',
    'format',
    'areaSales',
    'areaSalesPercentOfTotal',
    'areaTotal',
    'areaIsEstimate',
    'storeIsOpen24',
    'naturalFoodsAreIntegrated',
    'floating',
    'banner',
    'currentStoreStatus',
    'currentStoreSurvey',
    'storeCasings',
    'models',
    'storeVolumes',
    'storeStatuses'
  ];

  constructor(public dialogRef: MatDialogRef<StoreMergeDialogComponent>,
              @Inject(MAT_DIALOG_DATA)
              public data: any
  ) {
    this.site = data.site;
    this.selectedStores = data.selectedStores;
    this.duplicateStores = data.duplicateStores;
  }

  ngOnInit() {
    this.page1 = true;
  }

  toggleShow() {
    this.showing = !this.showing;
  }

  mergeStores() {
    this.merging = true;
    return of(null);
  }
}
