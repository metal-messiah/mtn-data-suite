import { Injectable } from '@angular/core';
import {ErrorDialogComponent} from '../error-dialog/error-dialog.component';
import {MatDialog} from '@angular/material';

@Injectable()
export class ErrorService {

  constructor(private dialog: MatDialog) {}

  handleServerError(message: string, err: object, cancel: () => void, retry?: () => void): void {
    const dialogRef = this.dialog.open(ErrorDialogComponent, {
      data: {message: message, reason: err['message'], status: err['status'], showRetry: retry !== undefined}
    });
    dialogRef.afterClosed().subscribe(doRetry => {
      if (retry !== undefined && doRetry === true) {
        retry();
      } else {
        cancel();
      }
    });
  }
}
