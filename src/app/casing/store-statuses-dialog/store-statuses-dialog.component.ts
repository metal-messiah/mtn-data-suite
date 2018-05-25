import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ErrorDialogComponent } from '../../shared/error-dialog/error-dialog.component';
import { Store } from '../../models/store';
import { SimplifiedStoreStatus } from '../../models/simplified-store-status';
import { FormControl } from '@angular/forms';
import { StoreService } from '../../core/services/store.service';
import { StoreStatus } from '../../models/store-status';

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
              @Inject(MAT_DIALOG_DATA) public data: { store: Store },
              private storeService: StoreService) {
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
    const storeStatus = new StoreStatus({
      status: this.selectedStatus.value,
      statusStartDate: this.statusDate.value
    });
    this.storeService.createNewStatus(this.store, storeStatus).subscribe((store: Store) => {
      console.log(store);
      this.initStore(store);
    }, err => {
      console.log(err);
    }, () => this.savingNewStatus = false);
  }

  deleteStatus(status: SimplifiedStoreStatus) {
    this.savingCurrentStatus = true;
    this.storeService.deleteStatus(this.store, status).subscribe((store: Store) => {
      this.initStore(store);
    }, err => {
      console.log(err);
    }, () => this.savingCurrentStatus = false);
  }

  setCurrentStatus(status: SimplifiedStoreStatus) {
    this.savingCurrentStatus = true;
    this.storeService.setCurrentStatus(this.store, status).subscribe((store: Store) => {
      this.initStore(store);
    }, err => {
      console.log(err);
    }, () => this.savingCurrentStatus = false);
  }

}
