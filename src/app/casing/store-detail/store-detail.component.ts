import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ErrorService } from '../../core/services/error.service';
import { StoreService } from '../../core/services/store.service';
import { Store } from '../../models/full/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AuditingEntity } from '../../models/auditing-entity';
import { CanComponentDeactivate } from '../../core/services/can-deactivate.guard';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { RoutingStateService } from '../../core/services/routing-state.service';
import { finalize, tap } from 'rxjs/internal/operators';
import { Observable } from 'rxjs/index';

@Component({
  selector: 'mds-store-detail',
  templateUrl: './store-detail.component.html',
  styleUrls: ['./store-detail.component.css']
})
export class StoreDetailComponent implements OnInit, CanComponentDeactivate {

  loading = false;
  store: Store;

  form: FormGroup;

  storeTypeOptions = ['ACTIVE', 'FUTURE', 'HISTORICAL'];

  constructor(private storeService: StoreService,
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
      floating: false,
      legacyLocationId: ''
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
    const saveStore = new Store(this.form.value);
    const strippedAE = new AuditingEntity(this.store);
    Object.assign(saveStore, strippedAE);
    return saveStore;
  }

  saveForm() {
    this.storeService.update(this.prepareSaveStore())
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


}
