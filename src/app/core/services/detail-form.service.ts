import {Injectable} from '@angular/core';
import {DetailFormComponent} from '../../interfaces/detail-form-component';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ErrorService} from './error.service';
import {ConfirmDialogComponent} from '../../shared/confirm-dialog/confirm-dialog.component';
import {Observable} from 'rxjs/Observable';
import { Entity } from '../../models/entity';

@Injectable()
export class DetailFormService<T extends Entity> {

  constructor(private snackBar: MatSnackBar,
              private errorService: ErrorService,
              private dialog: MatDialog) {
  }

  canDeactivate(fc: DetailFormComponent<T>): Observable<boolean> | boolean {
    if (fc.getForm().pristine) {
      return true;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {title: 'Warning!', question: 'Are you sure you wish to abandon unsaved changes?'}
    });
    return dialogRef.afterClosed();
  }

  save(fc: DetailFormComponent<T>) {
    // Set State
    fc.isSaving = true;
    fc.getForm().disable();

    // Callback to reenable
    const reenable = () => {
      fc.isSaving = false;
      fc.getForm().enable();
      fc.setDisabledFields();
    };

    // If object is new create it, otherwise update it
    if (fc.getSavableObj().getId() == null) {
      fc.getEntityService().create(fc.getSavableObj()).subscribe(
        created => {
          this.snackBar.open(`Successfully created ${fc.getTypeName()}!`, null, {duration: 2000});
          fc.setObj(created);
          fc.goBack();
        },
        err => this.errorService.handleServerError(
          `Failed to create ${fc.getTypeName()}`,
          err, reenable,
          () => this.save(fc)),
        reenable
      );
    } else {
      fc.getEntityService().update(fc.getSavableObj()).subscribe(
        updatedEntity => {
          this.snackBar.open(`Successfully updated ${fc.getTypeName()}!`, null, {duration: 2000});
          fc.setObj(updatedEntity);
          fc.goBack();
        },
        err => this.errorService.handleServerError(
          `Failed to update ${fc.getTypeName()}`,
          err, reenable,
          () => this.save(fc)),
        reenable
      );
    }
  }

  retrieveObj(fc: DetailFormComponent<T>) {
    fc.isLoading = true;
    const id = +fc.getRoute().snapshot.paramMap.get('id');
    if (id === null || id < 1) {
      fc.setObj(fc.getNewObj());
      fc.isLoading = false;
    } else {
      fc.getEntityService().getOneById(id).subscribe(
        obj => fc.setObj(obj),
        err => this.errorService.handleServerError(`Failed to retrieve ${fc.getTypeName()}!`, err,
          () => fc.goBack()),
        () => fc.isLoading = false
      );
    }
  }
}
