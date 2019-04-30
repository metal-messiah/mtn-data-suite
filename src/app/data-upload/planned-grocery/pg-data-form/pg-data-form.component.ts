import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import * as _ from 'lodash';

import { SourceUpdatable } from '../../../models/source-updatable';
import { PlannedGroceryService } from '../planned-grocery-service.service';
import { ErrorService } from '../../../core/services/error.service';
import { SimplifiedStoreStatus } from '../../../models/simplified/simplified-store-status';
import { MatDialog, MatSnackBar } from '@angular/material';
import { QuadDialogComponent } from '../../../casing/quad-dialog/quad-dialog.component';
import { SourceUpdatableService } from '../../../core/services/source-updatable.service';
import { SimplifiedStoreSource } from '../../../models/simplified/simplified-store-source';

@Component({
  selector: 'mds-pg-data-form',
  templateUrl: './pg-data-form.component.html',
  styleUrls: ['./pg-data-form.component.css']
})
export class PgDataFormComponent implements OnChanges {

  @Input() sourceUpdatable: SourceUpdatable;
  @Input() pgFeature: { attributes, geometry: { x: number, y: number } };
  @Input() storeSource: SimplifiedStoreSource;

  @Output() cancelEvent = new EventEmitter<void>();
  @Output() completedEvent = new EventEmitter<void>();

  saving = false;

  dbStatuses = [
    { displayName: 'Rumored', pgStatusId: -1, rank: 0 },
    { displayName: 'Strong Rumor', pgStatusId: -1, rank: 0 },
    { displayName: 'Dead Deal', pgStatusId: 99, rank: 1 },
    { displayName: 'Proposed', pgStatusId: 2, rank: 1 },
    { displayName: 'Planned', pgStatusId: 3, rank: 1 },
    { displayName: 'New Under Construction', pgStatusId: 1, rank: 1 },
    { displayName: 'Open', pgStatusId: 0, rank: 2 },
    { displayName: 'Remodel', pgStatusId: -1, rank: 2 },
    { displayName: 'Temporarily Closed', pgStatusId: -1, rank: 2 },
    { displayName: 'Closed', pgStatusId: -1, rank: 3 }
  ];
  currentStatus: { displayName: string, pgStatusId: number, rank: number };
  pgStatus: { displayName: string, pgStatusId: number, rank: number };
  doAddStatus = false;

  form: FormGroup;

  constructor(private pgService: PlannedGroceryService,
    private errorService: ErrorService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private sourceUpdatableService: SourceUpdatableService,
    private snackBar: MatSnackBar) {
    this.createForm();
  }

  ngOnChanges() {
    if (!(this.pgFeature && this.sourceUpdatable && this.storeSource)) {
      this.cancelEvent.emit();
    } else {
      if (!this.sourceUpdatable.siteId) {
        this.sourceUpdatable.latitude = this.pgFeature.geometry.y;
        this.sourceUpdatable.longitude = this.pgFeature.geometry.x;
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
    this.form.reset(this.sourceUpdatable);
    if (!this.sourceUpdatable.shoppingCenterId) {
      this.form.get('shoppingCenterName').setValue(this.pgFeature.attributes.NAMECENTER);
    }
    if (!this.sourceUpdatable.siteId) {
      this.form.get('address').setValue(this.pgFeature.attributes.DESCLOCATION);
      this.form.get('city').setValue(this.pgFeature.attributes.CITY);
      this.form.get('county').setValue(this.pgFeature.attributes.county);
      this.form.get('state').setValue(this.pgFeature.attributes.STATE);
      this.form.get('postalCode').setValue(this.pgFeature.attributes.ZIP);
    }
    if (!this.sourceUpdatable.storeId) {
      this.form.get('storeName').setValue(this.pgFeature.attributes.NAME);
      if (this.pgFeature.attributes.OPENDATE) {
        this.form.get('dateOpened').setValue(new Date(this.pgFeature.attributes.OPENDATE));
      }
      this.form.get('areaTotal').setValue(this.pgFeature.attributes.SIZESF);
    }
  }

  private getCurrentStatus(): { displayName: string, pgStatusId: number, rank: number } {
    if (!this.sourceUpdatable.storeStatuses || this.sourceUpdatable.storeStatuses.length < 1) {
      return { displayName: 'NONE', pgStatusId: -1, rank: -1 };
    }
    const pgEditedDateMs = this.pgFeature.attributes.EditDate;
    const relevantStatuses = this.sourceUpdatable.storeStatuses.filter(status => status.statusStartDate.getTime() <= pgEditedDateMs);
    const currentStatus = _.maxBy(relevantStatuses, 'statusStartDate');
    if (currentStatus) {
      return _.find(this.dbStatuses, { displayName: currentStatus.status });
    } else {
      return { displayName: 'NONE', pgStatusId: -1, rank: -1 };
    }
  }

  private getPgStatus(): { displayName: string, pgStatusId: number, rank: number } {
    return this.dbStatuses.find(status => status.pgStatusId === this.pgFeature.attributes.STATUS);
  }

  private prepareSubmission(): SourceUpdatable {
    const submission = new SourceUpdatable(this.form.value);
    if (submission.state != null) {
      submission.state = submission.state.toUpperCase();
    }
    submission.latitude = this.sourceUpdatable.latitude;
    submission.longitude = this.sourceUpdatable.longitude;
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
    this.sourceUpdatableService.submitUpdate(submission)
      .pipe(finalize(() => this.saving = false))
      .subscribe(
        result => {
          this.snackBar.open(`Successfully updated record`, 'View', { duration: 4000 })
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
