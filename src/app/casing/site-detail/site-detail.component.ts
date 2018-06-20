import { Component, OnInit } from '@angular/core';
import { CanComponentDeactivate } from '../../core/services/can-deactivate.guard';
import { Site } from '../../models/full/site';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SiteService } from '../../core/services/site.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ErrorService } from '../../core/services/error.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AuditingEntity } from '../../models/auditing-entity';
import { Observable } from 'rxjs/Observable';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { RoutingStateService } from '../../core/services/routing-state.service';
import { isString } from 'util';
import { QuadDialogComponent } from '../quad-dialog/quad-dialog.component';

@Component({
  selector: 'mds-site-detail',
  templateUrl: './site-detail.component.html',
  styleUrls: ['./site-detail.component.css']
})
export class SiteDetailComponent implements OnInit, CanComponentDeactivate {

  loading = false;
  site: Site;

  form: FormGroup;

  intersectionTypeOptions = ['Hard Corner', 'Mid Block', 'Soft Corner'];
  positionInCenterOptions = ['End Cap', 'Free Standing', 'Inside Corner', 'Mid-Center', 'N/A'];

  constructor(private siteService: SiteService,
              private router: Router,
              private route: ActivatedRoute,
              private routingState: RoutingStateService,
              private errorService: ErrorService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private _location: Location,
              private fb: FormBuilder) {
    this.createForm();
  }

  private createForm() {
    this.form = this.fb.group({
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      type: '',
      footprintSqft: '',
      positionInCenter: '',
      address1: '',
      address2: '',
      city: '',
      county: '',
      state: ['', [Validators.maxLength(2)]],
      postalCode: '',
      country: '',
      intersectionType: '',
      quad: '',
      intersectionStreetPrimary: '',
      intersectionStreetSecondary: '',
      duplicate: false
    });
  }

  ngOnInit() {
    const siteId = parseInt(this.route.snapshot.paramMap.get('siteId'), 10);
    this.loadSite(siteId);
  }

  private loadSite(siteId: number) {
    this.loading = true;
    this.siteService.getOneById(siteId)
      .finally(() => this.loading = false)
      .subscribe((site: Site) => {
          this.site = site;
          this.rebuildForm();
        },
        err => this.errorService.handleServerError('Failed to load Site!', err,
          () => this.goBack(),
          () => this.loadSite(siteId))
      );
  }

  private rebuildForm() {
    this.form.reset(this.site);
  }

  goBack() {
    this._location.back();
  };

  private prepareSaveSite(): Site {
    const saveSite = new Site(this.form.value);
    if (saveSite.state != null) {
      saveSite.state = saveSite.state.toUpperCase();
    }
    const strippedAE = new AuditingEntity(this.site);
    Object.assign(saveSite, strippedAE);
    return saveSite;
  }

  saveForm() {
    this.siteService.update(this.prepareSaveSite())
      .subscribe((site: Site) => {
        this.site = site;
        this.rebuildForm();
        this.snackBar.open(`Successfully updated Site`, null, {duration: 1000});
      }, err => this.errorService.handleServerError('Failed to update Site!', err,
        () => {
        },
        () => this.saveForm()));
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.form.pristine) {
      return true;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {title: 'Warning!', question: 'Are you sure you wish to abandon unsaved changes?'}
    });
    return dialogRef.afterClosed().do(result => {
      // Corrects for a bug between the router and CanDeactivateGuard that pops the state even if user says no
      if (!result) {
        history.pushState({}, 'site', this.routingState.getPreviousUrl());
      }
    });
  }

  showQuadDialog() {
    const dialogRef = this.dialog.open(QuadDialogComponent);

    dialogRef.afterClosed().subscribe(quad => {
      console.log(quad);
      if (isString(quad) && quad !== '') {
        const ctrl = this.form.get('quad');
        ctrl.setValue(quad);
        ctrl.markAsDirty();
      }
    });
  }
}
