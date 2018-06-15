import { Component, Inject, OnInit } from '@angular/core';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ShoppingCenterSurveyService } from '../../core/services/shopping-center-survey.service';
import { ShoppingCenterTenant } from '../../models/full/shopping-center-tenant';
import { ShoppingCenterTenantService } from '../../core/services/shopping-center-tenant.service';

@Component({
  selector: 'mds-tenant-list-dialog',
  templateUrl: './tenant-list-dialog.component.html',
  styleUrls: ['./tenant-list-dialog.component.css']
})
export class TenantListDialogComponent implements OnInit {

  shoppingCenterSurveyId: number;
  form: FormGroup;

  loading = false;

  constructor(private fb: FormBuilder,
              private shoppingCenterSurveyService: ShoppingCenterSurveyService,
              private shoppingCenterTenantService: ShoppingCenterTenantService,
              private snackBar: MatSnackBar,
              public dialogRef: MatDialogRef<ConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.createForm();
  }

  private createForm() {
    this.form = this.fb.group({
      newTenantNames: '',
      tenants: this.fb.array([])
    });
  }

  ngOnInit() {
    this.shoppingCenterSurveyId = this.data.shoppingCenterSurveyId;
    this.loading = true;
    this.shoppingCenterSurveyService.getAllTenants(this.shoppingCenterSurveyId)
      .finally(() => this.loading = false)
      .subscribe((tenants: ShoppingCenterTenant[]) => this.setTenants(tenants));
  }

  private setTenants(tenants: ShoppingCenterTenant[]) {
    const tenantFGs = tenants.map(tenant => this.createTenantFormGroup(tenant));
    const tenantFormArray = this.fb.array(tenantFGs);
    this.form.setControl('tenants', tenantFormArray);
    this.sortTenants();
  }

  private createTenantFormGroup(tenant: ShoppingCenterTenant): FormGroup {
    const group = this.fb.group(tenant);
    const control = group.get('name');
    control.setValidators(Validators.required);
    return group;
  }

  get newTenantNames() {
    return this.form.get('newTenantNames') as FormControl;
  }

  get tenants() {
    return this.form.get('tenants') as FormArray;
  }

  parseTenants(isOutparcel: boolean) {
    const newTenants: ShoppingCenterTenant[] = this.newTenantNames.value.split(',')
      .map((name: string) => name.trim())
      .filter(name => name !== '')
      .map(name => {
        return new ShoppingCenterTenant({name: name, outparcel: isOutparcel});
      });
    if (newTenants.length > 0) {
      this.loading = true;
      this.shoppingCenterSurveyService.createNewTenants(this.shoppingCenterSurveyId, newTenants)
        .finally(() => this.loading = false)
        .subscribe((tenants: ShoppingCenterTenant[]) => {
          tenants.forEach(tenant => this.tenants.push(this.createTenantFormGroup(tenant)));
          this.newTenantNames.reset();
          this.sortTenants();
          this.snackBar.open('Successfully Added Tenants', null, {duration: 1000});
        });
    }
  }

  deleteTenant(tenant: ShoppingCenterTenant, index: number) {
    this.loading = true;
    this.shoppingCenterTenantService.delete(tenant)
      .finally(() => this.loading = false)
      .subscribe(() => {
        this.tenants.removeAt(index);
        this.snackBar.open('Successfully Deleted Tenant', null, {duration: 1000});
      });
  }

  updateTenant(tenantFormControl: AbstractControl) {
    this.shoppingCenterTenantService.update(new ShoppingCenterTenant(tenantFormControl.value))
      .subscribe((tenant: ShoppingCenterTenant) => {
        tenantFormControl.reset(tenant);
        this.sortTenants();
        this.snackBar.open('Successfully Updated Tenant', null, {duration: 1000});
      });
  }

  private sortTenants() {
    this.tenants.controls.sort((a: FormControl, b: FormControl) => {
      return a.get('name').value.localeCompare(b.get('name').value);
    });
  }

}
