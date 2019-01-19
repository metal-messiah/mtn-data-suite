import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '../../models/full/store';
import { StoreService } from '../../core/services/store.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ErrorService } from '../../core/services/error.service';
import { StoreStatusesDialogComponent } from '../store-statuses-dialog/store-statuses-dialog.component';
import { StoreVolumeDialogComponent } from '../store-volume-dialog/store-volume-dialog.component';
import { StoreSelectionDialogComponent } from '../store-merge/store-selection-dialog/store-selection-dialog.component';

@Component({
  selector: 'mds-store-summary-card',
  templateUrl: './store-summary-card.component.html',
  styleUrls: ['./store-summary-card.component.css']
})
export class StoreSummaryCardComponent implements OnInit {

  @Input() store: Store;
  @Output() onStoreUpdated = new EventEmitter<Store>();

  constructor(private storeService: StoreService,
              private snackBar: MatSnackBar,
              private errorService: ErrorService,
              private dialog: MatDialog
  ) {
  }

  ngOnInit() {
  }

  updateStoreType(storeType: string) {
    const prevStoreType = this.store.storeType;
    this.store.storeType = storeType;
    this.storeService.update(this.store).subscribe((store: Store) => {
      this.onStoreUpdated.emit(store);
      this.snackBar.open('Updated Store Type', null, {duration: 2000});
    }, err => {
      this.store.storeType = prevStoreType;
      this.errorService.handleServerError('Failed to update store type', err,
        () => {
        },
        () => this.updateStoreType(storeType));
    });
  }

  openStoreStatusDialog() {
    const config = {data: {store: this.store}, disableClose: true, maxWidth: '300px'};
    const storeStatusDialog = this.dialog.open(StoreStatusesDialogComponent, config);
    storeStatusDialog.afterClosed().subscribe((store: Store) => {
      if (store != null) {
        this.store = store;
      }
    });
  }

  openVolumeDialog() {
    const config = {data: {store: this.store}, disableClose: true, maxWidth: '300px'};
    const storeVolumeDialog = this.dialog.open(StoreVolumeDialogComponent, config);
    storeVolumeDialog.afterClosed().subscribe((store: Store) => {
      if (store != null) {
        this.store = store;
      }
    });
  }

  setFloating(floating: boolean) {
    const prevFloating = this.store.floating;
    this.store.floating = floating;
    this.storeService.update(this.store).subscribe((store: Store) => {
      this.snackBar.open('Updated Store', null, {duration: 2000});
      this.onStoreUpdated.emit(store);
    }, err => {
      this.store.floating = prevFloating;
      this.errorService.handleServerError('Failed to update store', err,
        () => {
        },
        () => this.setFloating(floating));
    });
  }

  openStoreMergeDialog() {
    const config = {data: {store: this.store}, maxWidth: '90%'};
    const storeMergeDialog = this.dialog.open(StoreSelectionDialogComponent, config);
    storeMergeDialog.afterClosed().subscribe( (store: Store) => {
      this.store = store;
    });
  }
}
