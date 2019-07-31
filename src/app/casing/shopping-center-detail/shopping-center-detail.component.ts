import { Component, OnInit } from '@angular/core';
import { ShoppingCenter } from '../../models/full/shopping-center';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShoppingCenterService } from '../../core/services/shopping-center.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { ErrorService } from '../../core/services/error.service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/internal/operators';
import { CanComponentDeactivate } from '../../core/services/can-deactivate.guard';
import { DetailFormService } from '../../core/services/detail-form.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'mds-shopping-center-detail',
  templateUrl: './shopping-center-detail.component.html',
  styleUrls: ['./shopping-center-detail.component.css', '../entity-detail-view.css']
})
export class ShoppingCenterDetailComponent implements OnInit, CanComponentDeactivate {

  loading = false;
  saving = false;

  shoppingCenter: ShoppingCenter;

  form: FormGroup;

  readonly centerTypes = ['Anchor Only', 'Central Business District', 'Community Center', 'Free Standing',
    'Free Standing - Alone', 'Free Standing - Center', 'Lifestyle', 'Neighborhood Center', 'Power Center',
    'Regional Mall', 'Strip'];

  constructor(private shoppingCenterService: ShoppingCenterService,
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

    const shoppingCenterIdParam = this.route.snapshot.paramMap.get('shoppingCenterId');
    const shoppingCenterId = parseInt(shoppingCenterIdParam, 10);
    if (!shoppingCenterId || isNaN(shoppingCenterId)) {
      this.errorService.handleServerError('Invalid shoppingCenterId param!', {}, () => this._location.back());
    } else {
      this.loadShoppingCenter(shoppingCenterId);
    }
  }

  saveForm() {
    this.saving = true;
    this.shoppingCenterService.update(this.prepareSaveShoppingCenter())
      .pipe(finalize(() => this.saving = false))
      .subscribe((shoppingCenter: ShoppingCenter) => {
        this.form.reset(shoppingCenter);
        this.snackBar.open(`Successfully updated Shopping Center`, null, {duration: 1000});
        this._location.back();
      }, err => this.errorService.handleServerError('Failed to update Shopping Center!', err,
        () => console.log(err),
        () => this.saveForm()));
  }

  canDeactivate(): Observable<boolean> | boolean {
    return this.detailFormService.canDeactivate(this.form);
  }

  private createForm() {
    this.form = this.fb.group({
      name: '',
      owner: '',
      centerType: ''
    });
  }

  private loadShoppingCenter(shoppingCenterId: number) {
    this.loading = true;
    this.shoppingCenterService.getOneById(shoppingCenterId)
      .pipe(finalize(() => this.loading = false))
      .subscribe((shoppingCenter: ShoppingCenter) => {
          this.shoppingCenter = shoppingCenter;
          this.form.reset(this.shoppingCenter);
        },
        err => this.errorService.handleServerError('Failed to load Shopping Center!', err,
          () => this._location.back(),
          () => this.loadShoppingCenter(shoppingCenterId))
      );
  }

  private prepareSaveShoppingCenter(): ShoppingCenter {
    const savable = Object.assign({}, this.shoppingCenter);
    Object.keys(this.form.controls).forEach(key => {
      if (this.form.get(key).dirty) {
        savable[key] = this.form.get(key).value;
  }
    });
    return savable;
  }

}
