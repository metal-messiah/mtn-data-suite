import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { ErrorDialogComponent } from '../../shared/error-dialog/error-dialog.component';
import { Store } from '../../models/full/store';
import { FormBuilder } from '@angular/forms';
import { StoreService } from '../../core/services/store.service';
import { SimplifiedStoreVolume } from '../../models/simplified/simplified-store-volume';
import { ErrorService } from '../../core/services/error.service';
import { StoreVolumeService } from '../../core/services/store-volume.service';
import { finalize } from 'rxjs/internal/operators';
import { NewStoreVolumeComponent } from '../new-store-volume/new-store-volume.component';

@Component({
  selector: 'mds-store-volume-dialog',
  templateUrl: './store-volume-dialog.component.html',
  styleUrls: ['./store-volume-dialog.component.css']
})
export class StoreVolumeDialogComponent implements OnInit {

  store: Store;

  deletingVolume = false;

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { store: Store },
              private fb: FormBuilder,
              private dialog: MatDialog,
              private storeService: StoreService,
              private storeVolumeService: StoreVolumeService,
              private snackBar: MatSnackBar,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.initStore(this.data.store);
  }

  initStore(store: Store) {
    this.store = store;
    this.store.storeVolumes = this.store.storeVolumes.sort((a: SimplifiedStoreVolume, b: SimplifiedStoreVolume) => {
      return b.volumeDate.getTime() - a.volumeDate.getTime();
    });
  }

  deleteVolume(volume: SimplifiedStoreVolume) {
    this.deletingVolume = true;
    this.storeService.deleteVolume(this.store.id, volume)
      .pipe(finalize(() => this.deletingVolume = false))
      .subscribe((store: Store) => {
        this.snackBar.open('Successfully deleted volume', null, {duration: 2000});
        this.initStore(store);
      }, err => {
        this.errorService.handleServerError('Failed to delete Volume', err,
          () => console.log(err),
          () => this.deleteVolume(volume));
      });
  }

  openCreateDialog() {
    const newVolumeDialog = this.dialog.open(NewStoreVolumeComponent, {
      data: {storeId: this.store.id},
      maxWidth: '300px'
    });
    newVolumeDialog.afterClosed().subscribe(store => {
      if (store) {
        this.initStore(store);
      }
    })
  }

  editVolume(storeVolume: SimplifiedStoreVolume) {

    // TODO Implement
  }
}
