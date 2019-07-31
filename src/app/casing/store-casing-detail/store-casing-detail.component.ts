import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CanComponentDeactivate } from '../../core/services/can-deactivate.guard';
import { Observable } from 'rxjs';
import { DetailFormService } from '../../core/services/detail-form.service';
import { ErrorService } from '../../core/services/error.service';
import { StoreCasingDetailService } from './store-casing-detail.service';

@Component({
  selector: 'mds-store-casing-detail',
  templateUrl: './store-casing-detail.component.html',
  styleUrls: ['./store-casing-detail.component.css', '../entity-detail-view.css'],
  providers: [StoreCasingDetailService]
})
export class StoreCasingDetailComponent implements OnInit, CanComponentDeactivate {

  constructor(private service: StoreCasingDetailService,
              private detailFormService: DetailFormService,
              private route: ActivatedRoute,
              private _location: Location,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.loadData();
  }

  get loading() {
    return this.service.loading;
  }

  get saving() {
    return this.service.saving;
  }

  get formPristine() {
    return this.service.validatingForms.pristine;
  }

  get formInvalid() {
    return this.service.validatingForms.invalid;
  }

  get storeName() {
    return this.service.storeName;
  }

  get storeCasing() {
    return this.service.storeCasing;
  }

  saveForm() {
    this.service.save();
  }

  canDeactivate(): Observable<boolean> | boolean {
    return this.detailFormService.canDeactivate(this.service.validatingForms);
  }

  /**
   * Checks if proper url params exist and are integers.
   * Initializes service with store and casing ids.
   */
  private loadData() {
    const storeIdParam = this.route.snapshot.paramMap.get('storeId');
    const storeCasingIdParam = this.route.snapshot.paramMap.get('storeCasingId');

    if (storeIdParam && storeCasingIdParam) {

      const storeId = parseInt(storeIdParam, 10);
      const storeCasingId = parseInt(storeCasingIdParam, 10);

      if (isNaN(storeId) || isNaN(storeCasingId)) {
        this.errorService.handleServerError('Invalid storeId or storeCasingId!', {}, () => this._location.back());
      } else {
        this.service.initData(storeId, storeCasingId).subscribe(() => {
          },
          err => this.errorService.handleServerError('Failed to get store and casing!', err,
            () => this._location.back(), () => this.loadData()));
      }
    } else {
      this.errorService.handleServerError('Invalid storeId or storeCasingId!', {}, () => this._location.back());
    }
  }

}
