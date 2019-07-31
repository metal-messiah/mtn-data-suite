import { Injectable } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ErrorService } from './error.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { RoutingStateService } from './routing-state.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/internal/operators';
import { FormGroup } from '@angular/forms';

@Injectable()
export class DetailFormService {

  constructor(private snackBar: MatSnackBar,
              private errorService: ErrorService,
              private routingState: RoutingStateService,
              private dialog: MatDialog) {
  }

  canDeactivate(form: FormGroup): Observable<boolean> | boolean {
    if (form.pristine) {
      return true;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {title: 'Warning!', question: 'Are you sure you wish to abandon unsaved changes?'}
    });
    return dialogRef.afterClosed().pipe(tap(result => {
      // Corrects for a bug between the router and CanDeactivateGuard that pops the state even if user says no
      if (!result) {
        history.pushState({}, 'site', this.routingState.getPreviousUrl());
      }
    }));
  }

}
