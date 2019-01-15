import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '../../../models/full/store';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ErrorDialogComponent } from '../../../shared/error-dialog/error-dialog.component';
import { ErrorService } from '../../../core/services/error.service';
import { SiteService } from '../../../core/services/site.service';
import { Site } from '../../../models/full/site';
import { finalize } from 'rxjs/operators';
import { StoreService } from '../../../core/services/store.service';

@Component({
  selector: 'mds-store-selection-dialog',
  templateUrl: './store-selection-dialog.component.html',
  styleUrls: ['./store-selection-dialog.component.css']
})
export class StoreSelectionDialogComponent implements OnInit {

  store: Store;
  site: Site;
  loading = false;

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject (MAT_DIALOG_DATA) public data: { store: Store },
              private siteService: SiteService,
              private storeService: StoreService,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.store = this.data.store;
    this.loadStores(this.data.store.id);
  }

  loadStores(siteId: number) {
    this.loading = true;
    this.storeService.getAllByIds(siteId)
  }

  mergeStores(): void {
    this.merging = true;
    this.storeService.mergeStore([store], this.mergedStore)
      .pipe(finalize(() => this.merging = false))
      .subscribe(() => {
        const message = `Successfully merged`;
        this.snackBar.open(message, null, {duration: 2000});
      }, err => this.errorService.handleServerError('Failed to merge!', err,
        () => console.log(err)));
  }

}
