import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'mds-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent implements OnInit {

  message: string;
  reason: string;
  status: number;
  showRetry: boolean;
  showLogin: boolean;

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.message = data.message;
    this.reason = data.reason;
    this.status = data.status;
    this.showRetry = data.showRetry;
    this.showLogin = data.showLogin;
  }

  ngOnInit() {
  }

}
