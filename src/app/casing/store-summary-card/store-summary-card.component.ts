import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '../../models/full/store';
import { StoreService } from '../../core/services/store.service';
import { MatDialog, MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { ErrorService } from '../../core/services/error.service';
import { StoreStatusesDialogComponent } from '../store-statuses-dialog/store-statuses-dialog.component';
import { StoreVolumeDialogComponent } from '../store-volume-dialog/store-volume-dialog.component';

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
  ) { }

  ngOnInit() {
  }

  updateStoreType(storeType: string) {
    const prevStoreType = this.store.storeType;
    this.store.storeType = storeType;
    this.storeService.update(this.store).subscribe((store: Store) => {
      this.onStoreUpdated.emit(store);
      this.openSnackBar('Updated Store Type', null, 2000);
    }, err => {
      this.store.storeType = prevStoreType;
      this.errorService.handleServerError('Failed to update store type', err,
        () => {},
        () => this.updateStoreType(storeType));
    });
  }

  openSnackBar(message: string, action: string, duration: number) {
    const config: MatSnackBarConfig = {
      verticalPosition: 'bottom'
    };
    if (duration != null) {
      config['duration'] = duration;
    }
    return this.snackBar.open(message, action, config);
  }

  openStoreStatusDialog() {
    const config = {data: {store: this.store}, disableClose: true};
    const storeStatusDialog = this.dialog.open(StoreStatusesDialogComponent, config);
    storeStatusDialog.afterClosed().subscribe((store: Store) => {
      if (store != null) {
        this.store = store;
      }
    });
  }

  openVolumeDialog() {
    const config = {data: {store: this.store}, disableClose: true};
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
      this.onStoreUpdated.emit(store);
      this.openSnackBar('Updated Store', null, 2000);
    }, err => {
      this.store.floating = prevFloating;
      this.errorService.handleServerError('Failed to update store', err,
        () => {},
        () => this.setFloating(floating));
    });
  }

}
