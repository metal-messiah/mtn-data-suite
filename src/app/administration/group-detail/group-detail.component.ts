import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { CanComponentDeactivate } from '../../core/services/can-deactivate.guard';
import { DetailFormService } from '../../core/services/detail-form.service';
import { GroupService } from '../../core/services/group.service';
import { Group } from '../../models/full/group';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ErrorService } from '../../core/services/error.service';
import { MatDialog, MatSnackBar } from '@angular/material';

@Component({
  selector: 'mds-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css', '../detail-view.css']
})
export class GroupDetailComponent implements OnInit, CanComponentDeactivate {

  groupForm: FormGroup;

  group: Group;

  isSaving = false;
  isLoading = false;

  constructor(private groupService: GroupService,
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

  saveGroup() {
    const savable = Object.assign({}, this.group);
    Object.keys(this.groupForm.controls).forEach(key => {
      if (this.groupForm.get(key).dirty) {
        savable[key] = this.groupForm.get(key).value;
      }
    });

    const request = savable.id ? this.groupService.update(savable) : this.groupService.create(savable);

    this.isSaving = true;
    request.pipe(finalize(() => this.isSaving = false))
      .subscribe(group => {
        this.snackBar.open('Successfully saved group', null, {duration: 2000});
        this.groupForm.reset(group);
        this._location.back();
      }, err => this.errorService.handleServerError('Failed to save group!', err,
        () => console.log(err), () => this.saveGroup()));
  }

  deleteGroup() {
    const data = {
      title: 'Warning!',
      question: 'This action can only be undone by a DB Administrator. Are you sure you want to delete this group?'
    };
    this.dialog.open(ConfirmDialogComponent, {data: data}).afterClosed().subscribe(result => {
      if (result) {
        this.isSaving = true;
        this.groupService.delete(this.group.id)
          .pipe(finalize(() => this.isSaving = false))
          .subscribe(() => {
            this.snackBar.open('Successfully deleted group', null, {duration: 2000});
            this.groupForm.reset({});
    this._location.back();
    });
      }
      });
    }

  canDeactivate(): Observable<boolean> | boolean {
    return this.detailFormService.canDeactivate(this.groupForm);
  }

  private createForm() {
    this.groupForm = this.fb.group({
      displayName: ['', Validators.required],
      description: ''
    });
  }

  private getData() {
    const idString = this.route.snapshot.paramMap.get('id');
    if (idString) {
      const id = parseInt(idString, 10);

      this.isLoading = true;
      this.groupService.getOneById(id)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe(group => {
            this.group = group;
            this.groupForm.reset(this.group);
          }, err => this.errorService.handleServerError('Failed to get role!', err,
          () => this._location.back(), () => this.getData())
        );
    } else {
      this.group = new Group({});
    }
  }
}
