import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ErrorDialogComponent } from '../../shared/error-dialog/error-dialog.component';
import { Store } from '../../models/store';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { StoreService } from '../../core/services/store.service';
import { SimplifiedStoreVolume } from '../../models/simplified-store-volume';
import { StoreVolume } from '../../models/store-volume';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'mds-store-volume-dialog',
  templateUrl: './store-volume-dialog.component.html',
  styleUrls: ['./store-volume-dialog.component.css']
})
export class StoreVolumeDialogComponent implements OnInit {

  store: Store;

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
              private errorService: ErrorService) {
    this.createForm();
  }

  ngOnInit() {
    this.initStore(this.data.store);
  }

  createForm() {
    this.volumeForm = this.fb.group({
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

  addVolume() {
    this.savingVolume = true;
    const storeVolume = new StoreVolume(this.volumeForm.value);
    this.storeService.createNewVolume(this.store, storeVolume)
      .finally(() => this.savingVolume = false)
      .subscribe((store: Store) => {
        this.rebuildForm();
        this.initStore(store);
      }, err => {
        let message = err.message;
        if (err.error != null) {
          message = err.error.message;
        }
        this.errorService.handleServerError(message, err, () => {
        });
      });
  }

  deleteVolume(volume: SimplifiedStoreVolume) {
    this.savingVolume = true;
    this.storeService.deleteVolume(this.store, volume)
      .finally(() => this.savingVolume = false)
      .subscribe((store: Store) => {
        this.initStore(store);
      }, err => {
        this.errorService.handleServerError('Failed to delete Volume', err, () => {
        });
      });
  }
}
