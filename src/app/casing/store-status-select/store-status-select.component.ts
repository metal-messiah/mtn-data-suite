import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ErrorDialogComponent } from '../../shared/error-dialog/error-dialog.component';
import { Store } from '../../models/store';
import { SimplifiedStoreStatus } from '../../models/simplified-store-status';
import { FormControl } from '@angular/forms';
import { StoreService } from '../../core/services/store.service';

@Component({
  selector: 'mds-store-status-select',
  templateUrl: './store-status-select.component.html',
  styleUrls: ['./store-status-select.component.css']
})
export class StoreStatusSelectComponent implements OnInit {

  store: Store;
  statusDate: FormControl;
  selectedStatus: FormControl;

  saving = false;

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
              @Inject(MAT_DIALOG_DATA) public data: {store: Store},
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
    // TODO use form controls to create new Status
  }

  setCurrentStatus(status: SimplifiedStoreStatus) {
    this.saving = true;
    this.storeService.setCurrentStatus(this.store, status).subscribe((store: Store) => {
      this.initStore(store);
    }, err => {
      console.log(err);
    }, () => this.saving = false);
  }

}
