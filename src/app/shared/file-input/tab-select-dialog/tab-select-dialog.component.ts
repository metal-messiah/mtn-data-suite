import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'mds-tab-select-dialog',
  templateUrl: './tab-select-dialog.component.html',
  styleUrls: ['./tab-select-dialog.component.css']
})
export class TabSelectDialogComponent implements OnInit {
  sheetNames: string[];
  selectedSheet: string;

  constructor(
    public dialogRef: MatDialogRef<TabSelectDialogComponent>,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.sheetNames = data.sheetNames;
    this.selectedSheet = data.sheetNames[0];
    dialogRef.disableClose = true;
    
  }

  ngOnInit() {}

  close(): void {
    this.dialogRef.close();
  }

  proceed(): void {
    this.dialogRef.close(this.selectedSheet);
  }

  select(sheet) {
    this.selectedSheet = sheet;
  }
}
