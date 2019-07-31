import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ErrorService } from '../../core/services/error.service';
import { StoreService } from '../../core/services/store.service';
import { Store } from '../../models/full/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanComponentDeactivate } from '../../core/services/can-deactivate.guard';
import { finalize } from 'rxjs/internal/operators';
import { Observable } from 'rxjs';
import { SelectBannerComponent } from '../select-banner/select-banner.component';
import { BannerService } from '../../core/services/banner.service';
import { DetailFormService } from '../../core/services/detail-form.service';
import { CloudinaryUtil } from '../../utils/cloudinary-util';

@Component({
  selector: 'mds-store-detail',
  templateUrl: './store-detail.component.html',
  styleUrls: ['./store-detail.component.css', '../entity-detail-view.css']
})
export class StoreDetailComponent implements OnInit, CanComponentDeactivate {

  loading = false;
  saving = false;

  store: Store;

  form: FormGroup;

  readonly storeTypeOptions = ['ACTIVE', 'FUTURE', 'HISTORICAL'];
  readonly fitOptions = ['Aldi', 'Asian', 'Club', 'Conventional', 'Discount', 'Hispanic', 'Natural Foods', 'Quality/Service',
    'Save A Lot', 'Sprouts', 'Supercenter', 'Trader Joe\'s', 'Warehouse', 'Whole Foods'];
  readonly formatOptions = ['Asian', 'Club', 'Combo', 'Conventional', 'Conventional Mass Merchandiser', 'Discount', 'Ethnic',
    'Food/Drug Combo', 'Hispanic', 'Independent', 'International', 'Limited Assortment', 'Natural Foods',
    'Natural/Gourmet Foods', 'Super Combo', 'Supercenter', 'Superette/Small Grocery', 'Supermarket', 'Superstore',
    'Trader Joe\'s', 'Warehouse'];

  private readonly cloudinaryUtil: CloudinaryUtil;

  constructor(private storeService: StoreService,
              private detailFormService: DetailFormService,
              private bannerService: BannerService,
              private router: Router,
              private route: ActivatedRoute,
              private errorService: ErrorService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private _location: Location,
              private fb: FormBuilder) {
    this.cloudinaryUtil = new CloudinaryUtil();
  }

  ngOnInit() {
    this.createForm();
    const storeIdParam = this.route.snapshot.paramMap.get('storeId');
    const storeId = parseInt(storeIdParam, 10);
    if (!storeIdParam || isNaN(storeId)) {
      this.errorService.handleServerError('Invalid storeId param!', {}, () => this._location.back());
    } else {
      this.loadStore(storeId);
    }
  }

  getUrlForLogoFileName(fileName: string) {
    return this.cloudinaryUtil.getUrlForLogoFileName(fileName);
  }

  saveForm() {
    this.saving = true;
    this.storeService.update(this.prepareSaveStore())
      .pipe(finalize(() => this.saving = false))
      .subscribe((store: Store) => {
        this.form.reset(store);
        this.snackBar.open(`Successfully updated Store`, null, {duration: 1000});
        this._location.back();
      }, err => this.errorService.handleServerError('Failed to update store!', err,
        () => console.log(err),
        () => this.saveForm()));
  }

  canDeactivate(): Observable<boolean> | boolean {
    return this.detailFormService.canDeactivate(this.form);
  }

  showBannerDialog() {
    this.dialog.open(SelectBannerComponent, {maxWidth: '90%'}).afterClosed()
      .subscribe(result => {
        if (result && result.bannerName) {
          this.updateBanner(result.id);
        } else if (result === 'remove') {
          this.removeBanner();
        } else {
          console.log(result);
        }
      });
  }

  private updateBanner(bannerId: number) {
    this.saving = true;
    this.storeService.updateBanner(this.store.id, bannerId)
      .pipe(finalize(() => this.saving = false))
      .subscribe(store => {
          this.store = store;
          this.snackBar.open('Successfully Updated Banner', null, {duration: 1000});
        }, error => this.errorService.handleServerError('Failed to update banner!', error,
        () => console.log(error),
        () => this.updateBanner(bannerId))
      );
  }

  private removeBanner() {
    this.saving = true;
    this.storeService.removeBanner(this.store.id)
      .pipe(finalize(() => this.saving = false))
      .subscribe(store => {
          this.store = store;
          this.snackBar.open('Successfully Removed Banner', null, {duration: 1000});
        }, error => this.errorService.handleServerError('Failed to remove banner!', error,
        () => console.log(error),
        () => this.removeBanner())
      );
  }

  private createForm() {
    this.form = this.fb.group({
      storeName: '',
      storeNumber: '',
      storeType: ['', [Validators.required]],
      dateOpened: new Date(),
      dateClosed: new Date(),
      fit: '',
      format: '',
      areaSales: ['', [Validators.min(1)]],
      areaSalesPercentOfTotal: ['', [Validators.min(0.01), Validators.max(100)]],
      areaTotal: ['', [Validators.min(1)]],
      areaIsEstimate: '',
      storeIsOpen24: '',
      naturalFoodsAreIntegrated: '',
      floating: false
    });
  }

  private loadStore(storeId: number) {
    this.loading = true;
    this.storeService.getOneById(storeId)
      .pipe(finalize(() => this.loading = false))
      .subscribe((store: Store) => {
          this.store = store;
          this.form.reset(store);
        },
        err => {
          this.errorService.handleServerError('Failed to load Store!', err,
            () => this._location.back(),
            () => this.loadStore(storeId));
        }
      );
  }

  private prepareSaveStore(): Store {
    const savable = Object.assign({}, this.store);
    Object.keys(this.form.controls).forEach(key => {
      if (this.form.get(key).dirty) {
        savable[key] = this.form.get(key).value;
      }
    });

    return savable;
  }

}
