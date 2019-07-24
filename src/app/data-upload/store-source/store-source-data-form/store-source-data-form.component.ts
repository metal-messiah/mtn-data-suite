// UTILITIES
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
// SERVICES
import { ErrorService } from '../../../core/services/error.service';
// COMPONENTS
import { QuadDialogComponent } from '../../../casing/quad-dialog/quad-dialog.component';
import { SelectBannerComponent } from '../../../casing/select-banner/select-banner.component';
import { MapService } from '../../../core/services/map.service';
import { StoreSourceLayer } from '../../../models/store-source-layer';
import { StoreSourceMappable } from '../../../models/store-source-mappable';
import { Subscription } from 'rxjs';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { StoreSource } from '../../../models/full/store-source';
import { SourceUpdatable } from '../../../models/source-updatable';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SourceUpdatableService } from '../../../core/services/source-updatable.service';

@Component({
  selector: 'mds-store-source-data-form',
  templateUrl: './store-source-data-form.component.html',
  styleUrls: ['./store-source-data-form.component.css'],
  providers: [MapService]
})
export class StoreSourceDataFormComponent implements OnInit, OnDestroy {

  private cloudinaryParams = {
    cloudName: 'mtn-retail-advisors',
    username: 'tyler@mtnra.com',
    apiSecret: 'OGQKRd95GxzMrn5d7_D6FOd7lXs',
    apiKey: '713598197624775',
    multiple: true,
    maxFiles: 1
  };

  saving = false;

  storeSource: StoreSource;
  sourceUpdatable: SourceUpdatable;

  storeSourceLayer: StoreSourceLayer;

  subscriptions: Subscription[] = [];

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private sourceUpdatableService: SourceUpdatableService,
    private cloudinaryService: CloudinaryService,
    private errorService: ErrorService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<StoreSourceDataFormComponent>,
    private snackBar: MatSnackBar,
    private mapService: MapService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit() {
    this.cloudinaryService.initialize(this.cloudinaryParams);

    this.storeSource = this.data.storeSource;
    this.sourceUpdatable = this.data.sourceUpdatable;

    // If store source has a status, update it on the updatable
    if (this.storeSource && this.storeSource.storeSourceData &&
      this.storeSource.storeSourceData.storeStatus && this.storeSource.sourceEditedDate) {
      this.sourceUpdatable.storeStatus = this.storeSource.storeSourceData.storeStatus;
      this.sourceUpdatable.storeStatusStartDate = this.storeSource.sourceEditedDate;
    }

    this.createForm();
  }

  private createForm() {
    this.form = this.fb.group({
      address: this.sourceUpdatable.address,
      quad: this.sourceUpdatable.quad,
      intersectionStreetPrimary: this.sourceUpdatable.intersectionStreetPrimary,
      intersectionStreetSecondary: this.sourceUpdatable.intersectionStreetSecondary,
      city: this.sourceUpdatable.city,
      county: this.sourceUpdatable.county,
      state: this.sourceUpdatable.state,
      postalCode: this.sourceUpdatable.postalCode,
      storeName: this.sourceUpdatable.storeName,
      areaTotal: this.sourceUpdatable.areaTotal,
      dateOpened: this.sourceUpdatable.dateOpened
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onMapReady() {
    this.storeSourceLayer = new StoreSourceLayer(this.mapService);
    const dragListener = this.storeSourceLayer.markerDragEnd$.subscribe((mappable: StoreSourceMappable) => {
      const latLng = this.storeSourceLayer.getCoordinatesOfMappableMarker(mappable);
      this.sourceUpdatable.latitude = latLng.lat;
      this.sourceUpdatable.longitude = latLng.lng;
    });
    this.subscriptions.push(dragListener);

    const coords = {
      lat: this.sourceUpdatable.latitude,
      lng: this.sourceUpdatable.longitude
    };
    this.storeSourceLayer.setPin(coords, true);
  }

  hasOpeningDate() {
    const sourceData = this.storeSource.storeSourceData;
    return sourceData && sourceData.dateOpened;
  }

  getOpeningDate() {
    return this.storeSource.storeSourceData.dateOpened;
  }

  getUrlForLogoFileName() {
    const banner = this.sourceUpdatable.banner;
    return banner.logoFileName ? this.cloudinaryService.getUrlForLogoFileName(banner.logoFileName) : null;
  }

  getBannerName() {
    const banner = this.sourceUpdatable.banner;
    return banner ? banner.bannerName : null;
  }

  submit() {
    this.saving = true;
    const submission = this.prepareSubmission();
    return this.sourceUpdatableService.submitUpdate(submission)
      .subscribe(simpleStore => {
        this.snackBar.open('Successfully updated store', null, {duration: 2000});
        this.dialogRef.close({storeId: simpleStore.id});
      }, err => {
        this.saving = false;
        this.errorService.handleServerError(`Failed to update store!`, err,
          () => console.log(err), () => this.submit());
      });
  }

  private prepareSubmission(): SourceUpdatable {
    const submission = new SourceUpdatable(this.sourceUpdatable);

    Object.keys(this.form.controls).forEach(key => {
      if (this.form.get(key).dirty) {
        submission[key] = this.form.get(key).value;
      }
    });

    if (submission.state) {
      submission.state = submission.state.toUpperCase();
    }
    return submission;
  }

  get quad() {
    return this.form.get('quad').value;
  }

  showQuadDialog() {
    const dialogRef = this.dialog.open(QuadDialogComponent);

    dialogRef.afterClosed().subscribe((quad) => {
      if (typeof quad === 'string' && quad !== '') {
        const ctrl = this.form.get('quad');
        ctrl.setValue(quad);
        ctrl.markAsDirty();
      }
    });
  }

  storeNameIsDifferent() {
    return this.form.get('storeName').value !== this.storeSource.sourceStoreName;
  }

  copyStoreName() {
    const value = this.storeSource.sourceStoreName;
    const control = this.form.get('storeName');
    control.setValue(value);
    control.markAsDirty();
  }

  showIntersectionFields() {
    const sourceData = this.storeSource.storeSourceData;
    // If sourceData exists AND it has an address AND either the address doesn't match the updatable address OR the address is dirty
    return sourceData && sourceData.address && (this.isDifferent('address') || this.form.get('address').dirty);
  }

  isDifferent(attrName: string) {
    return this.form.get(attrName).value !== this.storeSource.storeSourceData[attrName];
  }

  selectBanner() {
    const dialog = this.dialog.open(SelectBannerComponent, {maxWidth: '90%'});
    dialog.afterClosed().subscribe(result => {
      if (result && result.bannerName) {
        this.sourceUpdatable.banner = result;
      } else if (result === 'remove') {
        this.sourceUpdatable.banner = null;
      }
    });
  }

}
