import { Component, OnInit } from '@angular/core';
import { CanComponentDeactivate } from '../../core/services/can-deactivate.guard';
import { Site } from '../../models/full/site';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SiteService } from '../../core/services/site.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ErrorService } from '../../core/services/error.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuadDialogComponent } from '../quad-dialog/quad-dialog.component';
import { finalize } from 'rxjs/internal/operators';
import { Observable } from 'rxjs';
import { DetailFormService } from '../../core/services/detail-form.service';

@Component({
  selector: 'mds-site-detail',
  templateUrl: './site-detail.component.html',
  styleUrls: ['./site-detail.component.css', '../entity-detail-view.css']
})
export class SiteDetailComponent implements OnInit, CanComponentDeactivate {

  loading = false;
  saving = false;

  site: Site;

  form: FormGroup;

  readonly intersectionTypeOptions = ['Hard Corner', 'Mid Block', 'Soft Corner'];
  readonly positionInCenterOptions = ['End Cap', 'Free Standing', 'Inside Corner', 'Mid-Center', 'N/A'];

  constructor(private siteService: SiteService,
              private router: Router,
              private route: ActivatedRoute,
              private detailFormService: DetailFormService,
              private errorService: ErrorService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private _location: Location,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.createForm();
    const siteIdParam = this.route.snapshot.paramMap.get('siteId');
    const siteId = parseInt(siteIdParam, 10);
    if (!siteIdParam || isNaN(siteId)) {
      this.errorService.handleServerError('Invalid siteId param!', {}, () => this._location.back());
    } else {
      this.loadSite(siteId);
    }
  }

  saveForm() {
    this.saving = true;
    this.siteService.update(this.prepareSaveSite())
      .pipe(finalize(() => this.saving = false))
      .subscribe((site: Site) => {
        this.form.reset(site);
        this.snackBar.open(`Successfully updated Site`, null, {duration: 1000});
        this._location.back();
      }, err => this.errorService.handleServerError('Failed to update Site!', err,
        () => console.log(err),
        () => this.saveForm()));
  }

  canDeactivate(): Observable<boolean> | boolean {
    return this.detailFormService.canDeactivate(this.form);
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

  private createForm() {
    this.form = this.fb.group({
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      type: '',
      intersectionType: '',
      address1: '',
      address2: '',
      city: '',
      state: ['', [Validators.maxLength(2)]],
      postalCode: '',
      county: '',
      country: '',
      intersectionStreetPrimary: '',
      intersectionStreetSecondary: '',
      quad: '',
      positionInCenter: '',
      duplicate: false,
      backfilledNonGrocery: false
    });
  }

  private loadSite(siteId: number) {
    this.loading = true;
    this.siteService.getOneById(siteId)
      .pipe(finalize(() => this.loading = false))
      .subscribe((site: Site) => {
          this.site = site;
          this.form.reset(this.site);
        },
        err => this.errorService.handleServerError('Failed to load Site!', err,
          () => this._location.back(),
          () => this.loadSite(siteId))
      );
  }

  private prepareSaveSite(): Site {
    const saveSite = Object.assign({}, this.site);
    Object.keys(this.form.controls).forEach(key => {
      if (this.form.get(key).dirty) {
        saveSite[key] = this.form.get(key).value;
      }
    });

    if (saveSite.state) {
      saveSite.state = saveSite.state.toUpperCase();
    }
    return saveSite;
  }
}
