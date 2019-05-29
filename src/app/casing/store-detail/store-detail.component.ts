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
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { RoutingStateService } from '../../core/services/routing-state.service';
import { finalize, tap } from 'rxjs/internal/operators';
import { Observable } from 'rxjs';
import { SelectBannerComponent } from '../select-banner/select-banner.component';
import { BannerService } from '../../core/services/banner.service';

@Component({
  selector: 'mds-store-detail',
  templateUrl: './store-detail.component.html',
  styleUrls: ['./store-detail.component.css']
})
export class StoreDetailComponent implements OnInit, CanComponentDeactivate {

  loading = false;
  saving = false;

  store: Store;

  form: FormGroup;

  storeTypeOptions = ['ACTIVE', 'FUTURE', 'HISTORICAL'];
  fitOptions = ['Aldi', 'Asian', 'Club', 'Conventional', 'Discount', 'Hispanic', 'Natural Foods', 'Quality/Service',
    'Save A Lot', 'Sprouts', 'Supercenter', 'Trader Joe\'s', 'Warehouse', 'Whole Foods'];
  formatOptions = ['Asian', 'Club', 'Combo', 'Conventional', 'Conventional Mass Merchandiser', 'Discount', 'Ethnic',
    'Food/Drug Combo', 'Hispanic', 'Independent', 'International', 'Limited Assortment', 'Natural Foods',
    'Natural/Gourmet Foods', 'Super Combo', 'Supercenter', 'Superette/Small Grocery', 'Supermarket', 'Superstore',
    'Trader Joe\'s', 'Warehouse'];

  constructor(private storeService: StoreService,
              private bannerService: BannerService,
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

  ngOnInit() {
    const storeId = parseInt(this.route.snapshot.paramMap.get('storeId'), 10);
    this.loadStore(storeId);
  }

  private loadStore(storeId: number) {
    this.loading = true;
    this.storeService.getOneById(storeId)
      .pipe(finalize(() => this.loading = false))
      .subscribe((store: Store) => {
          this.store = store;
          this.rebuildForm();
        },
        err => this.errorService.handleServerError('Failed to load Store!', err,
          () => this.goBack(),
          () => this.loadStore(storeId))
      );
  }

  private rebuildForm() {
    this.form.reset(this.store);
  }

  goBack() {
    this._location.back();
  };

  private prepareSaveStore(): Store {
    const saveStore = JSON.parse(JSON.stringify(this.store));
    Object.keys(this.form.controls).forEach(key => {
      if (this.form.get(key).dirty) {
        saveStore[key] = this.form.get(key).value
      }
    });
    return saveStore;
  }

  saveForm() {
    this.saving = true;
    this.storeService.update(this.prepareSaveStore())
      .pipe(finalize(() => this.saving = false))
      .subscribe((store: Store) => {
        this.store = store;
        this.rebuildForm();
        this.snackBar.open(`Successfully updated Store`, null, {duration: 1000});
      }, err => this.errorService.handleServerError('Failed to update store!', err,
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
    return dialogRef.afterClosed().pipe(tap(result => {
      // Corrects for a bug between the router and CanDeactivateGuard that pops the state even if user says no
      if (!result) {
        history.pushState({}, 'site', this.routingState.getPreviousUrl());
      }
    }));
  }

  selectBanner() {
    const dialog = this.dialog.open(SelectBannerComponent, {maxWidth: '90%'});
    dialog.afterClosed().subscribe(result => {
      if (result && result.bannerName) {
        this.updateBanner(result.id);
      } else if (result === 'remove') {
        this.removeBanner();
      } else {
        console.log(result);
      }
    })
  }

  updateBanner(bannerId: number) {
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

  removeBanner() {
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

  getBannerImageSrc(banner) {
    return this.bannerService.getBannerImageSrc(banner);
  }

}
