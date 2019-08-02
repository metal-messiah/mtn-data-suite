import {Injectable} from '@angular/core';
import {ErrorDialogComponent} from '../../shared/error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {AuthService} from './auth.service';

@Injectable()
export class ErrorService {

  constructor(private dialog: MatDialog,
              private auth: AuthService) {
  }

  handleServerError(message: string, err: object, cancel: () => void, retry?: () => void): void {
    let reason: string;
    let showRetry = true;
    let showLogin = false;
    const status = err['status'];
    switch (status) {
      case 0: {
        reason = 'Cannot connect to web service!';
        break;
      }
      case 400: {
        showRetry = false;
        let msg: string;
        if (err['error'] && err['error']['message']) {
          msg = err['error']['message'];
        } else if (err['error']) {
          msg = err['error'];
        } else if (err['message']) {
          msg = err['message'];
        } else {
          msg = err.toString();
        }
        reason = `Bad Request: ${msg}`;
        break;
      }
      case 401: {
        showLogin = true;
        showRetry = false;
        reason = 'You are unauthorized to view this resource! You may need to log in again.';
        break;
      }
      case 403: {
        reason = 'Forbidden: You are not permitted to view this resource!';
        showRetry = false;
        break;
      }
      case 404: {
        reason = 'The requested resource was not found!';
        break;
      }
      case 500: {
        showRetry = false;
        reason = 'Internal Server Error: Something went wrong on the backend - contact technical support!';
        break;
      }
      default: {
        reason = err['message'];
        break;
      }
    }

    const dialogRef = this.dialog.open(ErrorDialogComponent, {
      data: {
        message: message,
        reason: reason,
        status: err['status'],
        showRetry: showRetry && retry !== undefined,
        showLogin: showLogin
      },
      width: '250px'
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response === 'retry') {
        retry();
      } else if (response === 'signIn') {
        this.auth.signIn();
      } else {
        cancel();
      }
    });
  }
}
