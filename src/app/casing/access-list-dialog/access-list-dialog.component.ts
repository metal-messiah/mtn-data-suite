import { Component, Inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef, MatExpansionPanel, MatSnackBar } from '@angular/material';
import { ShoppingCenterAccess } from '../../models/full/shopping-center-access';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShoppingCenterSurveyService } from '../../core/services/shopping-center-survey.service';
import { ShoppingCenterAccessService } from '../../core/services/shopping-center-access.service';
import { ErrorService } from '../../core/services/error.service';
import { finalize } from 'rxjs/internal/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'mds-access-list-dialog',
  templateUrl: './access-list-dialog.component.html',
  styleUrls: ['./access-list-dialog.component.css']
})
export class AccessListDialogComponent implements OnInit {

  @ViewChildren(MatExpansionPanel) panels: QueryList<MatExpansionPanel>;

  shoppingCenterSurveyId: number;
  form: FormGroup;

  loading = false;
  saving = false;

  accessTypeOptions = ['FRONT_MAIN', 'SIDE_MAIN', 'NON_MAIN'];

  constructor(private fb: FormBuilder,
              private shoppingCenterSurveyService: ShoppingCenterSurveyService,
              private shoppingCenterAccessService: ShoppingCenterAccessService,
              private snackBar: MatSnackBar,
              private errorService: ErrorService,
              public dialogRef: MatDialogRef<ConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.createForm();
  }

  private createForm() {
    this.form = this.fb.group({
      accesses: this.fb.array([])
    });
  }

  ngOnInit() {
    this.shoppingCenterSurveyId = this.data.shoppingCenterSurveyId;
    this.loadAccesses();
  }

  private loadAccesses() {
    this.loading = true;
    this.shoppingCenterSurveyService.getAllAccesses(this.shoppingCenterSurveyId)
      .pipe(finalize(() => this.loading = false))
      .subscribe((accesses: ShoppingCenterAccess[]) => {
          this.setAccesses(accesses);
        },
        err => this.errorService.handleServerError('Failed to load accesses!', err,
          () => console.log(err),
          () => this.loadAccesses()));
  }

  private setAccesses(accesses: ShoppingCenterAccess[]) {
    const accessFGs = accesses.map(access => this.createAccessFormGroup(access));
    const accessFormArray = this.fb.array(accessFGs);
    this.form.setControl('accesses', accessFormArray);
  }

  private createAccessFormGroup(access: ShoppingCenterAccess): FormGroup {
    const group = this.fb.group(access);
    const control = group.get('accessType');
    control.setValidators(Validators.required);
    return group;
  }

  get accesses() {
    return this.form.get('accesses') as FormArray;
  }

  createNewAccess() {
    const newAccess = new ShoppingCenterAccess({
      hasRightIn: true,
      hasRightOut: true,
      accessType: this.accessTypeOptions[0]
    });
    this.saveNewAccess(newAccess);
  }

  private saveNewAccess(newAccess: ShoppingCenterAccess) {
    this.loading = true;
    this.shoppingCenterSurveyService.createNewAccess(this.shoppingCenterSurveyId, newAccess)
      .pipe(finalize(() => this.loading = false))
      .subscribe((savedAccess: ShoppingCenterAccess) => {
        this.accesses.push(this.createAccessFormGroup(savedAccess));
        setTimeout(() => this.panels.last.open(), 300);
        this.snackBar.open('Successfully Added Access', null, {duration: 1000});
      }, err => this.errorService.handleServerError('Failed to create new access!', err,
        () => {
        },
        () => this.saveNewAccess(newAccess)));
  }

  deleteAccess(access: ShoppingCenterAccess, index: number) {
    this.saving = true;
    this.shoppingCenterAccessService.delete(access.id)
      .pipe(finalize(() => this.saving = false))
      .subscribe(() => {
        this.accesses.removeAt(index);
        this.snackBar.open('Successfully Deleted Access', null, {duration: 1000});
      }, err => this.errorService.handleServerError('Failed to delete access!', err,
        () => {
        },
        () => this.deleteAccess(access, index)));
  }

  saveAllAndClose() {
    const dirtyAccessControls = (this.form.get('accesses') as FormArray).controls.filter(control => control.dirty);
    if (dirtyAccessControls.length > 0) {
      this.saving = true;
      forkJoin(dirtyAccessControls.map(dac => this.updateAccess(dac)))
        .pipe(finalize(() => this.saving = false))
        .subscribe(results => {
          this.snackBar.open(`Successfully Updated ${results.length} Accesses`, null, {duration: 1000});
          this.dialogRef.close();
        }, err => this.errorService.handleServerError('Failed to update access!', err,
          () => console.log(err),
          () => this.saveAllAndClose()));
    }
  }

  updateAccess(accessFormControl: AbstractControl) {
    return this.shoppingCenterAccessService.update(new ShoppingCenterAccess(accessFormControl.value));
  }
}
