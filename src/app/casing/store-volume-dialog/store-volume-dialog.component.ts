import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorDialogComponent } from '../../shared/error-dialog/error-dialog.component';
import { Store } from '../../models/full/store';
import { FormBuilder } from '@angular/forms';
import { StoreService } from '../../core/services/store.service';
import { ErrorService } from '../../core/services/error.service';
import { StoreVolumeService } from '../../core/services/store-volume.service';
import { finalize } from 'rxjs/internal/operators';
import { NewStoreVolumeComponent } from '../new-store-volume/new-store-volume.component';
import { StoreVolume } from '../../models/full/store-volume';

@Component({
  selector: 'mds-store-volume-dialog',
  templateUrl: './store-volume-dialog.component.html',
  styleUrls: ['./store-volume-dialog.component.css']
})
export class StoreVolumeDialogComponent implements OnInit {

  store: Store;
  storeVolumes: StoreVolume[];

  loading = false;

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
    this.store = this.data.store;
    this.loadVolumes(this.data.store.id);
  }

  loadVolumes(storeId: number) {
    this.loading = true;
    this.storeService.getAllVolumes(storeId)
      .pipe(finalize(() => this.loading = false))
      .subscribe((storeVolumes: StoreVolume[]) => {
        this.storeVolumes = storeVolumes.sort((a: StoreVolume, b: StoreVolume) => {
          return b.volumeDate.getTime() - a.volumeDate.getTime();
        });
      }, err => this.errorService.handleServerError('Failed to retrieve store volumes', err,
        () => console.log(err),
        () => this.loadVolumes(storeId)));
  }

  deleteVolume(volume: StoreVolume) {
    this.deletingVolume = true;
    this.storeService.deleteVolume(this.store.id, volume)
      .pipe(finalize(() => this.deletingVolume = false))
      .subscribe((store: Store) => {
        this.store = store;
        this.snackBar.open('Successfully deleted volume', null, {duration: 2000});
        this.loadVolumes(store.id);
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
    newVolumeDialog.afterClosed().subscribe((store: Store) => {
      if (store) {
        this.store = store;
        this.loadVolumes(store.id);
      }
    })
  }

}
