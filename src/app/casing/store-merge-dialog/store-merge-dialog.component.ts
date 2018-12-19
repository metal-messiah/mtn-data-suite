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
  page2;
  showing = true;
  storeId: number;
  duplicates: Store[];

  constructor(public dialogRef: MatDialogRef<StoreMergeDialogComponent>,
              @Inject(MAT_DIALOG_DATA)
              public data: any
  ) {
    this.site = data.site;
    this.storeId = data.selectedStoreId;

  }

  ngOnInit() {
    this.page1 = true;
  }

  goToPage2() {
    this.page2 = true;
  }

  toggleShow() {
    this.showing = !this.showing;
  }

  mergeStores() {
    this.merging = true;
    return of(null);
  }
}
