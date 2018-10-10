import { Component, Inject, OnInit } from '@angular/core';
import { SimplifiedStoreVolume } from '../../models/simplified/simplified-store-volume';
import { StoreVolume } from '../../models/full/store-volume';
import { ErrorDialogComponent } from '../../shared/error-dialog/error-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { StoreService } from '../../core/services/store.service';
import { ErrorService } from '../../core/services/error.service';
import { finalize } from 'rxjs/internal/operators';

@Component({
  selector: 'mds-store-volumes-selection',
  templateUrl: './store-volumes-selection.component.html',
  styleUrls: ['./store-volumes-selection.component.css']
})
export class StoreVolumesSelectionComponent implements OnInit {

  storeVolumes: StoreVolume[];
  loading = false;
  error: string;

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: {storeId: number},
              private storeService: StoreService,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    if (this.data.storeId != null) {
      this.loadVolumes(this.data.storeId);
    } else {
      this.error = 'No storeId provided!';
    }
  }

  loadVolumes(storeId: number) {
    this.loading = true;
    this.storeService.getAllVolumes(this.data.storeId)
      .pipe(finalize(() => this.loading = false))
      .subscribe((storeVolumes: StoreVolume[]) => {
        this.storeVolumes = storeVolumes.sort((a: StoreVolume, b: StoreVolume) => {
          return b.volumeDate.getTime() - a.volumeDate.getTime();
        });
      }, err => this.errorService.handleServerError('Failed to retrieve store volumes', err,
        () => console.log(err),
        () => this.loadVolumes(storeId)));
  }

  copyVolume(volume: SimplifiedStoreVolume) {
    this.dialogRef.close(volume);
  }

}
