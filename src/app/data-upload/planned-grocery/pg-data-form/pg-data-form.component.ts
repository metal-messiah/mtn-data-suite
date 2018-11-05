import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import * as _ from 'lodash';

import { PlannedGroceryUpdatable } from '../../../models/planned-grocery-updatable';
import { StoreSource } from '../../../models/full/store-source';
import { PlannedGroceryService } from '../planned-grocery-service.service';
import { ErrorService } from '../../../core/services/error.service';
import { SimplifiedStoreStatus } from '../../../models/simplified/simplified-store-status';
import { MatDialog, MatSnackBar } from '@angular/material';
import { QuadDialogComponent } from '../../../casing/quad-dialog/quad-dialog.component';

@Component({
  selector: 'mds-pg-data-form',
  templateUrl: './pg-data-form.component.html',
  styleUrls: ['./pg-data-form.component.css']
})
export class PgDataFormComponent implements OnChanges {

  @Input() pgUpdatable: PlannedGroceryUpdatable;
  @Input() pgFeature: { attributes, geometry: { x: number, y: number } };
  @Input() storeSource: StoreSource;

  @Output() cancelEvent = new EventEmitter<void>();
  @Output() completedEvent = new EventEmitter<void>();

  saving = false;

  dbStatuses = [
    {displayName: 'Rumored', pgStatusId: -1, rank: 0},
    {displayName: 'Strong Rumor', pgStatusId: -1, rank: 0},
    {displayName: 'Dead Deal', pgStatusId: 99, rank: 1},
    {displayName: 'Proposed', pgStatusId: 2, rank: 1},
    {displayName: 'Planned', pgStatusId: 3, rank: 1},
    {displayName: 'New Under Construction', pgStatusId: 1, rank: 1},
    {displayName: 'Open', pgStatusId: 0, rank: 2},
    {displayName: 'Remodel', pgStatusId: -1, rank: 2},
    {displayName: 'Temporarily Closed', pgStatusId: -1, rank: 2},
    {displayName: 'Closed', pgStatusId: -1, rank: 3}
  ];
  currentStatus: { displayName: string, pgStatusId: number, rank: number };
  pgStatus: { displayName: string, pgStatusId: number, rank: number };
  doAddStatus = false;

  form: FormGroup;

  constructor(private pgService: PlannedGroceryService,
              private errorService: ErrorService,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private snackBar: MatSnackBar) {
    this.createForm();
  }

  ngOnChanges() {
    if (!(this.pgFeature && this.pgUpdatable && this.storeSource)) {
      this.cancelEvent.emit();
    } else {
      console.log(this.pgFeature);
      if (!this.pgUpdatable.siteId) {
        this.pgUpdatable.latitude = this.pgFeature.geometry.y;
        this.pgUpdatable.longitude = this.pgFeature.geometry.x;
      }

      this.currentStatus = this.getCurrentStatus();
      this.pgStatus = this.getPgStatus();
      this.doAddStatus = this.pgStatus && this.currentStatus &&
        this.pgStatus !== this.currentStatus &&
        this.pgStatus.rank >= this.currentStatus.rank;

      this.resetForm();
    }
  }

  private createForm() {
    this.form = this.fb.group({
      shoppingCenterId: null,
      shoppingCenterName: '',
      siteId: null,
      address: '',
      city: '',
      county: '',
      state: '',
      postalCode: '',
      quad: '',
      intersectionStreetPrimary: '',
      intersectionStreetSecondary: '',
      storeId: null,
      storeName: '',
      dateOpened: '',
      storeSurveyId: null,
      areaTotal: '',
      storeStatuses: []
    });
  }

  private resetForm() {
    this.form.reset(this.pgUpdatable);
    if (!this.pgUpdatable.shoppingCenterId) {
      this.form.get('shoppingCenterName').setValue(this.pgFeature.attributes.NAMECENTER);
    }
    if (!this.pgUpdatable.siteId) {
      this.form.get('address').setValue(this.pgFeature.attributes.DESCLOCATION);
      this.form.get('city').setValue(this.pgFeature.attributes.CITY);
      this.form.get('county').setValue(this.pgFeature.attributes.county);
      this.form.get('state').setValue(this.pgFeature.attributes.STATE);
      this.form.get('postalCode').setValue(this.pgFeature.attributes.ZIP);
    }
    if (!this.pgUpdatable.storeId) {
      this.form.get('storeName').setValue(this.pgFeature.attributes.NAME);
      if (this.pgFeature.attributes.OPENDATE) {
        this.form.get('dateOpened').setValue(new Date(this.pgFeature.attributes.OPENDATE));
      }
      this.form.get('areaTotal').setValue(this.pgFeature.attributes.SIZESF);
    }
  }

  private getCurrentStatus(): { displayName: string, pgStatusId: number, rank: number } {
    if (!this.pgUpdatable.storeStatuses || this.pgUpdatable.storeStatuses.length < 1) {
      return {displayName: 'NONE', pgStatusId: -1, rank: -1};
    }
    const pgEditedDateMs = this.pgFeature.attributes.EditDate;
    const relevantStatuses = this.pgUpdatable.storeStatuses.filter(status => status.statusStartDate.getTime() <= pgEditedDateMs);
    const currentStatus = _.maxBy(relevantStatuses, 'statusStartDate');
    if (currentStatus) {
      return _.find(this.dbStatuses, {displayName: currentStatus.status});
    } else {
      return {displayName: 'NONE', pgStatusId: -1, rank: -1};
    }
  }

  private getPgStatus(): { displayName: string, pgStatusId: number, rank: number } {
    return this.dbStatuses.find(status => status.pgStatusId === this.pgFeature.attributes.STATUS);
  }

  private prepareSubmission(): PlannedGroceryUpdatable {
    const submission = new PlannedGroceryUpdatable(this.form.value);
    if (submission.state != null) {
      submission.state = submission.state.toUpperCase();
    }
    submission.latitude = this.pgUpdatable.latitude;
    submission.longitude = this.pgUpdatable.longitude;
    if (this.doAddStatus) {
      if (!submission.storeStatuses) {
        submission.storeStatuses = [];
      }
      const storeStatusDate = new Date(this.pgFeature.attributes.EditDate);
      const newStatus = new SimplifiedStoreStatus({
        status: this.getPgStatus().displayName,
        statusStartDate: storeStatusDate
      });
      submission.storeStatuses.push(newStatus);
    }
    submission.storeSource = this.storeSource;
    return submission;
  }

  submit() {
    const submission = this.prepareSubmission();

    this.saving = true;
    this.pgService.submitUpdate(submission)
      .pipe(finalize(() => this.saving = false))
      .subscribe(
        result => {
          this.snackBar.open(`Successfully updated record`, 'View', {duration: 4000})
            .onAction().subscribe(() => {
            window.open(location.origin + '/casing?store-id=' + result.id, '_blank');
          });

          this.completedEvent.emit();
        },
        err => this.errorService.handleServerError(
          `Failed to update from PG record!`, err,
          () => console.log(err))
      )
  }

  getPgFeatureOpenDate(): string {
    if (this.pgFeature) {
      if (this.pgFeature.attributes.OPENDATE) {
        return new Date(this.pgFeature.attributes.OPENDATE).toDateString();
      } else if (this.pgFeature.attributes.OPENDATEAPPROX) {
        return this.pgFeature.attributes.OPENDATEAPPROX;
      }
    }
    return '';
  }

  showQuadDialog() {
    const dialogRef = this.dialog.open(QuadDialogComponent);

    dialogRef.afterClosed().subscribe(quad => {
      console.log(quad);
      if (typeof quad === 'string' && quad !== '') {
        const ctrl = this.form.get('quad');
        ctrl.setValue(quad);
        ctrl.markAsDirty();
      }
    });
  }

}
