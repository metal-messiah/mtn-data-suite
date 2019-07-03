import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExtractionFieldSet } from '../../models/full/extraction-field-set';
import { ExtractionService } from '../../core/services/extraction.service';
import { finalize } from 'rxjs/operators';
import { ExtractionFieldSetService } from '../../core/services/extraction-field-set.service';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'mds-download-dialog',
  templateUrl: './download-dialog.component.html',
  styleUrls: ['./download-dialog.component.css']
})
export class DownloadDialogComponent implements OnInit {

  loading = false;
  downloading = false;

  selectedStoreIds: number[] = [];

  fieldSets: ExtractionFieldSet[];
  selectedFieldSet: ExtractionFieldSet;

  constructor(public dialogRef: MatDialogRef<DownloadDialogComponent>,
              private extractionService: ExtractionService,
              private extractionFieldSetService: ExtractionFieldSetService,
              private errorService: ErrorService,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.selectedStoreIds = data.selectedStoreIds;
  }

  ngOnInit() {
    this.loading = true;
    this.extractionFieldSetService.getAllFieldSets()
      .pipe(finalize(() => this.loading = false))
      .subscribe((fieldSets) => {
          this.fieldSets = fieldSets;
          this.selectedFieldSet = this.fieldSets[0];
        },
        err => this.errorService.handleServerError('Failed to retrieve field-sets!', err,
          () => this.dialogRef.close()));
  }

  download() {
    this.downloading = true;
    this.extractionService.extractLatestDataForStores(this.selectedStoreIds, this.selectedFieldSet.id)
      .pipe(finalize(() => this.downloading = false))
      .subscribe((response) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = 'extraction.csv';
        a.target = '_blank';
        a.click();
        a.remove();
        this.dialogRef.close();
      }, err => this.errorService.handleServerError('Failed to download!', err,
        () => console.log(err),
        () => this.download()));
  }

}
