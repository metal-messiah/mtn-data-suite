import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StoreService } from '../../core/services/store.service';
import { ErrorService } from '../../core/services/error.service';
import { StoreVolume } from '../../models/full/store-volume';
import { finalize } from 'rxjs/internal/operators';
import { Store } from '../../models/full/store';

@Component({
  selector: 'mds-new-store-volume',
  templateUrl: './new-store-volume.component.html',
  styleUrls: ['./new-store-volume.component.css']
})
export class NewStoreVolumeComponent implements OnInit {

  form: FormGroup;

  creating = false;

  volumeTypeOptions = [
    'ACTUAL',
    'ESTIMATE',
    'PROJECTION',
    'THIRD_PARTY',
    'PLACEHOLDER'
  ];

  constructor(private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: { storeId: number },
              private dialogRef: MatDialogRef<NewStoreVolumeComponent>,
              private errorService: ErrorService,
              private storeService: StoreService) { }

  ngOnInit() {
    this.form = this.fb.group({
      volumeTotal: ['', [Validators.required, Validators.min(10000), Validators.max(10000000)]],
      volumeBoxTotal: ['', [Validators.min(10000), Validators.max(100000000)]],
      volumeDate: [new Date(), Validators.required],
      volumeType: 'ESTIMATE'
    });
  }

  create() {
    const volumeValue = this.form.get('volumeDate').value;
    const volumeDate = new Date(volumeValue.getTime() - new Date().getTimezoneOffset() * 60 * 1000);
    const storeVolume = new StoreVolume({
      volumeTotal: this.form.get('volumeTotal').value,
      volumeBoxTotal: this.form.get('volumeBoxTotal').value,
      volumeDate: volumeDate,
      volumeType: this.form.get('volumeType').value
    });
    this.creating = true;
    this.storeService.createNewVolume(this.data.storeId, storeVolume)
      .pipe(finalize(() => this.creating = false))
      .subscribe((store: Store) => this.dialogRef.close(store),
        err => this.errorService.handleServerError('Failed to create new Volume', err,
          () => {},
          () => this.create())
      );
  }

}
