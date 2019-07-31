import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';

@Component({
  selector: 'mds-tab-select-dialog',
  templateUrl: './tab-select-dialog.component.html',
  styleUrls: ['./tab-select-dialog.component.css']
})
export class TabSelectDialogComponent {
  sheetNames: string[];

  constructor(
    public dialogRef: MatDialogRef<TabSelectDialogComponent>,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.sheetNames = data.sheetNames;
  }

  select(sheet) {
      this.dialogRef.close(sheet);
  }
}
