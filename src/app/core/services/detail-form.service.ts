import {Injectable} from '@angular/core';
import {DetailFormComponent} from '../../interfaces/detail-form-component';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ErrorService} from './error.service';
import {ConfirmDialogComponent} from '../../shared/confirm-dialog/confirm-dialog.component';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class DetailFormService<T> {

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
    fc.isSaving = true;
    fc.getForm().disable();
    const reenable = () => {
      fc.isSaving = false;
      fc.getForm().enable();
    };
    fc.getObjService().save(fc.getSavableObj()).subscribe(
      savedObj => {
        this.snackBar.open(`Successfully saved ${fc.getTypeName()}!`, null, {duration: 2000});
        fc.setObj(savedObj);
        fc.goBack();
      },
      err => this.errorService.handleServerError(
        `Failed to save ${fc.getTypeName()}`,
        err, reenable,
        () => this.save(fc)),
      reenable
    );
  }

  retrieveObj(fc: DetailFormComponent<T>) {
    fc.isLoading = true;
    const id = +fc.getRoute().snapshot.paramMap.get('id');
    if (id === null || id < 1) {
      fc.setObj(fc.getNewObj());
      fc.isLoading = false;
    } else {
      fc.getObjService().getOneById(id).subscribe(
        obj => fc.setObj(obj),
        err => this.errorService.handleServerError(`Failed to retrieve ${fc.getTypeName()}!`, err,
          () => fc.goBack()),
        () => fc.isLoading = false
      );
    }
  }
}
