import { Component, OnInit } from '@angular/core';
import { ShoppingCenter } from '../../models/full/shopping-center';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShoppingCenterService } from '../../core/services/shopping-center.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Location } from '@angular/common';
import { RoutingStateService } from '../../core/services/routing-state.service';
import { ErrorService } from '../../core/services/error.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditingEntity } from '../../models/auditing-entity';

@Component({
  selector: 'mds-shopping-center-detail',
  templateUrl: './shopping-center-detail.component.html',
  styleUrls: ['./shopping-center-detail.component.css']
})
export class ShoppingCenterDetailComponent implements OnInit {

  loading = false;
  shoppingCenter: ShoppingCenter;

  form: FormGroup;

  constructor(private shoppingCenterService: ShoppingCenterService,
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
      name: '',
      owner: ''
    });
  }

  ngOnInit() {
    const shoppingCenterId = parseInt(this.route.snapshot.paramMap.get('shoppingCenterId'), 10);
    this.loadShoppingCenter(shoppingCenterId);
  }

  private loadShoppingCenter(shoppingCenterId: number) {
    this.loading = true;
    this.shoppingCenterService.getOneById(shoppingCenterId)
      .finally(() => this.loading = false)
      .subscribe((shoppingCenter: ShoppingCenter) => {
          this.shoppingCenter = shoppingCenter;
          this.rebuildForm();
        },
        err => this.errorService.handleServerError('Failed to load Shopping Center!', err,
          () => this.goBack(),
          () => this.loadShoppingCenter(shoppingCenterId))
      );
  }

  private rebuildForm() {
    this.form.reset(this.shoppingCenter);
  }

  goBack() {
    this._location.back();
  };

  private prepareSaveShoppingCenter(): ShoppingCenter {
    const saveSC = new ShoppingCenter(this.form.value);
    const strippedAE = new AuditingEntity(this.shoppingCenter);
    Object.assign(saveSC, strippedAE);
    return saveSC;
  }

  saveForm() {
    this.shoppingCenterService.update(this.prepareSaveShoppingCenter())
      .subscribe((shoppingCenter: ShoppingCenter) => {
        this.shoppingCenter = shoppingCenter;
        this.rebuildForm();
        this.snackBar.open(`Successfully updated Shopping Center`, null, {duration: 1000});
      }, err => this.errorService.handleServerError('Failed to update Shopping Cetner!', err,
        () => {
        },
        () => this.saveForm()));
  }

}
