import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Role } from '../../models/full/role';

import { ErrorService } from '../../core/services/error.service';
import { RoleService } from '../../core/services/role.service';
import { CanComponentDeactivate } from '../../core/services/can-deactivate.guard';
import { DetailFormService } from '../../core/services/detail-form.service';
import { finalize } from 'rxjs/internal/operators';
import { Observable } from 'rxjs';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'mds-role-detail',
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.css', '../detail-view.css']
})
export class RoleDetailComponent implements OnInit, CanComponentDeactivate {

  roleForm: FormGroup;

  role: Role;

  isSaving = false;
  isLoading = false;

  constructor(private roleService: RoleService,
              private route: ActivatedRoute,
              private _location: Location,
              private fb: FormBuilder,
              private errorService: ErrorService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private detailFormService: DetailFormService) {
  }

  ngOnInit() {
    this.createForm();
    this.getData();
  }

  saveRole() {
    const savable = Object.assign({}, this.role);
    Object.keys(this.roleForm.controls).forEach(key => {
      if (this.roleForm.get(key).dirty) {
        savable[key] = this.roleForm.get(key).value;
      }
    });

    const request = savable.id ? this.roleService.update(savable) : this.roleService.create(savable);

    this.isSaving = true;
    request.pipe(finalize(() => this.isSaving = false))
      .subscribe(role => {
        this.snackBar.open('Successfully saved role', null, {duration: 2000});
        this.roleForm.reset(role);
        this._location.back();
      }, err => this.errorService.handleServerError('Failed to save role!', err,
        () => console.log(err), () => this.saveRole()));
  }

  deleteRole() {
    const data = {
      title: 'Warning!',
      question: 'This action can only be undone by a DB Administrator. Are you sure you want to delete this role?'
    };
    this.dialog.open(ConfirmDialogComponent, {data: data}).afterClosed().subscribe(result => {
      if (result) {
        this.isSaving = true;
        this.roleService.delete(this.role.id)
          .pipe(finalize(() => this.isSaving = false))
          .subscribe(() => {
            this.snackBar.open('Successfully deleted role', null, {duration: 2000});
            this.roleForm.reset({});
            this._location.back();
          });
      }
    });
  }

  canDeactivate(): Observable<boolean> | boolean {
    return this.detailFormService.canDeactivate(this.roleForm);
  }

  private createForm() {
    this.roleForm = this.fb.group({
      displayName: ['', Validators.required],
      description: ''
    });
  }

  private getData() {
    const idString = this.route.snapshot.paramMap.get('id');
    if (idString) {
      const id = parseInt(idString, 10);

      this.isLoading = true;
      this.roleService.getOneById(id)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe(role => {
          this.role = role;
          this.roleForm.reset(this.role);
        }, err => this.errorService.handleServerError('Failed to get role!', err,
          () => this._location.back(), () => this.getData()));
    } else {
      this.role = new Role({});
    }
  }

}
