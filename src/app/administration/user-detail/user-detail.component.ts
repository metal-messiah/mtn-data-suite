import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { UserProfile } from '../../models/full/user-profile';

import { UserProfileService } from '../../core/services/user-profile.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorService } from '../../core/services/error.service';
import { CanComponentDeactivate } from '../../core/services/can-deactivate.guard';
import { DetailFormService } from '../../core/services/detail-form.service';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/internal/operators';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'mds-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css', '../detail-view.css']
})
export class UserDetailComponent implements OnInit, CanComponentDeactivate {

  userProfileForm: FormGroup;

  userProfile: UserProfile;

  isSaving = false;
  isLoading = false;

  constructor(private userProfileService: UserProfileService,
              private route: ActivatedRoute,
              private router: Router,
              private _location: Location,
              private snackBar: MatSnackBar,
              private errorService: ErrorService,
              private dialog: MatDialog,
              private fb: FormBuilder,
              private detailFormService: DetailFormService) {
  }

  ngOnInit() {
    this.createForm();
    this.getData();
  }

  createForm(): void {
    this.userProfileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: '',
      lastName: '',
    });
  }

  saveUser() {
    const savable = Object.assign({}, this.userProfile);
    Object.keys(this.userProfileForm.controls).forEach(key => {
      if (this.userProfileForm.get(key).dirty) {
        savable[key] = this.userProfileForm.get(key).value;
      }
    });

    const request = savable.id ? this.userProfileService.update(savable) : this.userProfileService.create(savable);

    this.isSaving = true;
    request.pipe(finalize(() => this.isSaving = false))
      .subscribe(userProfile => {
        this.snackBar.open('Successfully saved user profile', null, {duration: 2000});
        this.userProfileForm.reset(userProfile);
        this._location.back();
      }, err => this.errorService.handleServerError('Failed to save user profile', err,
        () => console.log(err), () => this.saveUser()));
  }

  deleteUser() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {title: 'Warning!', question: 'This action can only be undone by DB Administrator. Are you sure you want to delete this user?'}
    }).afterClosed().subscribe(result => {
      if (result) {
        this.isSaving = true;
        this.userProfileService.delete(this.userProfile.id)
          .pipe(finalize(() => this.isSaving = false))
          .subscribe(() => {
            this.snackBar.open('Successfully deleted user profile', null, {duration: 2000});
            this.userProfileForm.reset({});
            this._location.back();
          }, err => this.errorService.handleServerError('Failed to delete User Profile!', err,
            () => console.log(err), () => this.deleteUser()));
      }
    });
  }

  canDeactivate(): Observable<boolean> | boolean {
    return this.detailFormService.canDeactivate(this.userProfileForm);
  }

  private getData() {
    const idString = this.route.snapshot.paramMap.get('id');
    if (idString) {
      const id = parseInt(idString, 10);
      this.isLoading = true;
      this.userProfileService.getOneById(id)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe(userProfile => {
          this.userProfile = userProfile;
          this.userProfileForm.reset(this.userProfile);
        }, err => this.errorService.handleServerError('Failed to get user profile!', err,
          () => this._location.back, () => this.getData()));
    } else {
      this.userProfile = new UserProfile({});
    }
  }
}
