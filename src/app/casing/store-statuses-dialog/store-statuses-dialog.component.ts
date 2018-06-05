import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ErrorDialogComponent } from '../../shared/error-dialog/error-dialog.component';
import { Store } from '../../models/store';
import { SimplifiedStoreStatus } from '../../models/simplified-store-status';
import { FormControl } from '@angular/forms';
import { StoreService } from '../../core/services/store.service';
import { StoreStatus } from '../../models/store-status';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'mds-store-statuses-dialog',
  templateUrl: './store-statuses-dialog.component.html',
  styleUrls: ['./store-statuses-dialog.component.css']
})
export class StoreStatusesDialogComponent implements OnInit {

  store: Store;
  statusDate: FormControl;
  selectedStatus: FormControl;

  savingCurrentStatus = false;
  savingNewStatus = false;

  storeStatusOptions = [
    'Closed',
    'Dead Deal',
    'New Under Construction',
    'Open',
    'Planned',
    'Proposed',
    'Remodel',
    'Rumored',
    'Strong Rumor',
    'Temporarily Closed'
  ];

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { store: Store, allowStatusSelection?: boolean },
              private storeService: StoreService,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.statusDate = new FormControl(new Date());
    this.selectedStatus = new FormControl('Open');
    this.initStore(this.data.store);
  }

  initStore(store: Store) {
    this.store = store;
    this.store.storeStatuses = this.store.storeStatuses.sort((a: SimplifiedStoreStatus, b: SimplifiedStoreStatus) => {
      return b.statusStartDate.getTime() - a.statusStartDate.getTime();
    });
  }

  closeDialog(): void {
    this.dialogRef.close(this.store);
  }

  addStatus() {
    this.savingNewStatus = true;
    const date: Date = this.statusDate.value;
    const storeStatus = new StoreStatus({
      status: this.selectedStatus.value,
      statusStartDate: new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
    });
    this.storeService.createNewStatus(this.store, storeStatus)
      .finally(() => this.savingNewStatus = false)
      .subscribe((store: Store) => {
        this.initStore(store);
      }, err => {
        this.errorService.handleServerError('Failed to add new  Status', err, () => {});
      });
  }

  deleteStatus(status: SimplifiedStoreStatus) {
    this.savingCurrentStatus = true;
    this.storeService.deleteStatus(this.store, status)
      .finally(() => this.savingCurrentStatus = false)
      .subscribe((store: Store) => {
        this.initStore(store);
      }, err => {
        this.errorService.handleServerError('Failed to delete Status', err, () => {});
      });
  }

  setCurrentStatus(status: SimplifiedStoreStatus) {
    this.savingCurrentStatus = true;
    this.storeService.setCurrentStatus(this.store, status)
      .finally(() => this.savingCurrentStatus = false)
      .subscribe((store: Store) => {
        this.initStore(store);
      }, err => {
        this.errorService.handleServerError('Failed to update Store', err, () => {});
      });
  }

  useForCasing(status: SimplifiedStoreStatus) {
    this.dialogRef.close(status);
  }

}
