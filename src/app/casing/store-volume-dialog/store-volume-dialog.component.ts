import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { ErrorDialogComponent } from '../../shared/error-dialog/error-dialog.component';
import { Store } from '../../models/full/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StoreService } from '../../core/services/store.service';
import { SimplifiedStoreVolume } from '../../models/simplified/simplified-store-volume';
import { StoreVolume } from '../../models/full/store-volume';
import { ErrorService } from '../../core/services/error.service';
import { StoreVolumeService } from '../../core/services/store-volume.service';
import { finalize } from 'rxjs/internal/operators';

@Component({
  selector: 'mds-store-volume-dialog',
  templateUrl: './store-volume-dialog.component.html',
  styleUrls: ['./store-volume-dialog.component.css']
})
export class StoreVolumeDialogComponent implements OnInit {

  store: Store;
  editingVolume: StoreVolume;

  volumeForm: FormGroup;

  savingVolume = false;

  volumeTypeOptions = [
    'ACTUAL',
    'ESTIMATE',
    'PROJECTION',
    'THIRD_PARTY'
  ];

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { store: Store },
              private fb: FormBuilder,
              private storeService: StoreService,
              private storeVolumeService: StoreVolumeService,
              private snackBar: MatSnackBar,
              private errorService: ErrorService) {
    this.createForm();
  }

  ngOnInit() {
    this.initStore(this.data.store);
  }

  createForm() {
    this.volumeForm = this.fb.group({
      id: null,
      volumeTotal: ['', [Validators.required, Validators.min(10000), Validators.max(10000000)]],
      volumeDate: [new Date(), Validators.required],
      volumeType: 'ESTIMATE'
    });
  }

  rebuildForm() {
    this.volumeForm.reset(new StoreVolume({
      volumeType: 'ESTIMATE',
      volumeDate: new Date()
    }));
  }

  initStore(store: Store) {
    this.store = store;
    this.store.storeVolumes = this.store.storeVolumes.sort((a: SimplifiedStoreVolume, b: SimplifiedStoreVolume) => {
      return b.volumeDate.getTime() - a.volumeDate.getTime();
    });
  }

  closeDialog(): void {
    this.dialogRef.close(this.store);
  }

  editVolume(volume: SimplifiedStoreVolume) {
    this.savingVolume = true;
    this.storeVolumeService.getOneById(volume.id)
      .pipe(finalize(() => this.savingVolume = false))
      .subscribe((v: StoreVolume) => {
        this.editingVolume = v;
        this.volumeForm.reset(v);
      }, this.onError);
  }

  cancelEdit() {
    this.editingVolume = null;
    this.rebuildForm();
  }

  saveEditedVolume() {
    this.savingVolume = true;
    const date: Date = this.volumeForm.get('volumeDate').value;
    this.editingVolume.volumeDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    this.editingVolume.volumeTotal = this.volumeForm.get('volumeTotal').value;
    this.editingVolume.volumeType = this.volumeForm.get('volumeType').value;
    this.storeVolumeService.update(this.editingVolume)
      .pipe(finalize(() => this.savingVolume = false))
      .subscribe((storeVolume: StoreVolume) => {
        this.snackBar.open('Successfully updated volume', null, {duration: 2000});
        this.editingVolume = storeVolume;
        const i = this.store.storeVolumes.findIndex((v) => v.id === storeVolume.id);
        this.store.storeVolumes[i] = storeVolume;
      }, this.onError);
  }

  addVolume() {
    this.savingVolume = true;
    const storeVolume = new StoreVolume(this.volumeForm.value);
    storeVolume.volumeDate = new Date(storeVolume.volumeDate.getTime() - new Date().getTimezoneOffset() * 60 * 1000);
    this.storeService.createNewVolume(this.store, storeVolume)
      .pipe(finalize(() => this.savingVolume = false))
      .subscribe((store: Store) => {
        this.snackBar.open('Successfully added new volume', null, {duration: 2000});
        this.rebuildForm();
        this.initStore(store);
      }, (err) => this.onError(err));
  }

  onError(err) {
    let message = err.message;
    if (err.error != null) {
      message = err.error.message;
    }
    this.errorService.handleServerError(message, err, () => {
    });
  }

  deleteVolume(volume: SimplifiedStoreVolume) {
    this.savingVolume = true;
    this.storeService.deleteVolume(this.store, volume)
      .pipe(finalize(() => this.savingVolume = false))
      .subscribe((store: Store) => {
        this.snackBar.open('Successfully deleted volume', null, {duration: 2000});
        this.initStore(store);
      }, err => {
        this.errorService.handleServerError('Failed to delete Volume', err, () => {
        });
      });
  }
}
