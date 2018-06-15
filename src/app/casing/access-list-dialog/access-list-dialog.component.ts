import { Component, Inject, OnInit } from '@angular/core';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { ShoppingCenterAccess } from '../../models/full/shopping-center-access';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShoppingCenterSurveyService } from '../../core/services/shopping-center-survey.service';
import { ShoppingCenterAccessService } from '../../core/services/shopping-center-access.service';

@Component({
  selector: 'mds-access-list-dialog',
  templateUrl: './access-list-dialog.component.html',
  styleUrls: ['./access-list-dialog.component.css']
})
export class AccessListDialogComponent implements OnInit {

  shoppingCenterSurveyId: number;
  form: FormGroup;

  loading = false;

  accessTypeOptions = ['FRONT_MAIN', 'SIDE_MAIN', 'NON_MAIN'];

  constructor(private fb: FormBuilder,
              private shoppingCenterSurveyService: ShoppingCenterSurveyService,
              private shoppingCenterAccessService: ShoppingCenterAccessService,
              private snackBar: MatSnackBar,
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
    this.loading = true;
    this.shoppingCenterSurveyService.getAllAccesses(this.shoppingCenterSurveyId)
      .finally(() => this.loading = false)
      .subscribe((accesses: ShoppingCenterAccess[]) => this.setAccesses(accesses));
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
    this.loading = true;
    this.shoppingCenterSurveyService.createNewAccess(this.shoppingCenterSurveyId, newAccess)
      .finally(() => this.loading = false)
      .subscribe((access: ShoppingCenterAccess) => {
        this.accesses.push(this.createAccessFormGroup(newAccess));
        this.snackBar.open('Successfully Added Access', null, {duration: 1000});
      });
  }

  deleteAccess(access: ShoppingCenterAccess, index: number) {
    this.loading = true;
    this.shoppingCenterAccessService.delete(access)
      .finally(() => this.loading = false)
      .subscribe((response) => {
        this.accesses.removeAt(index);
        this.snackBar.open('Successfully Deleted Access', null, {duration: 1000});
      });
  }

  updateAccess(accessFormControl: AbstractControl) {
    this.shoppingCenterAccessService.update(new ShoppingCenterAccess(accessFormControl.value))
      .subscribe((access: ShoppingCenterAccess) => {
        accessFormControl.reset(access);
        this.snackBar.open('Successfully Updated Access', null, {duration: 1000});
      });
  }
}
