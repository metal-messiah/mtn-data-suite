import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Site } from '../../models/full/site';

@Component({
  selector: 'mds-store-merge-dialog',
  templateUrl: './store-merge-dialog.component.html',
  styleUrls: ['./store-merge-dialog.component.css']
})
export class StoreMergeDialogComponent {

  site: Site;

  constructor(public dialogRef: MatDialogRef<StoreMergeDialogComponent>,
              @Inject(MAT_DIALOG_DATA)
              public data: any,
  ) {
    this.site = data.site;

  }
}
