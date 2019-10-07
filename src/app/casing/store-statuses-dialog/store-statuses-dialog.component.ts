import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../../shared/error-dialog/error-dialog.component';
import { Store } from '../../models/full/store';
import { SimplifiedStoreStatus } from '../../models/simplified/simplified-store-status';
import { StoreService } from '../../core/services/store.service';
import { ErrorService } from '../../core/services/error.service';
import { finalize } from 'rxjs/internal/operators';
import { NewStoreStatusComponent } from '../new-store-status/new-store-status.component';

@Component({
  selector: 'mds-store-statuses-dialog',
  templateUrl: './store-statuses-dialog.component.html',
  styleUrls: ['./store-statuses-dialog.component.css']
})
export class StoreStatusesDialogComponent implements OnInit {

  store: Store;

  savingCurrentStatus = false;

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { store: Store, allowStatusSelection?: boolean },
              private dialog: MatDialog,
              private storeService: StoreService,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.initStore(this.data.store);
  }

  initStore(store: Store) {
    this.store = store;
    this.store.storeStatuses = this.store.storeStatuses.sort((a: SimplifiedStoreStatus, b: SimplifiedStoreStatus) => {
      return b.statusStartDate.getTime() - a.statusStartDate.getTime();
    });
  }

  deleteStatus(status: SimplifiedStoreStatus) {
    this.savingCurrentStatus = true;
    this.storeService.deleteStatus(this.store.id, status)
      .pipe(finalize(() => this.savingCurrentStatus = false))
      .subscribe((store: Store) => {
        this.initStore(store);
      }, err => {
        this.errorService.handleServerError('Failed to delete Status', err, () => {});
      });
  }

  useForCasing(status: SimplifiedStoreStatus) {
    this.dialogRef.close(status);
  }

  openCreateDialog() {
    const newStatusDialog = this.dialog.open(NewStoreStatusComponent, {
      data: {storeId: this.store.id},
      maxWidth: '90%'
    });
    newStatusDialog.afterClosed().subscribe(store => {
      if (store) {
        this.initStore(store);
      }
    });
  }

}
