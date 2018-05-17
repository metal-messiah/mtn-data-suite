import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/site';
import { SimplifiedShoppingCenterCasing } from '../../models/simplified-shopping-center-casing';
import { ShoppingCenterCasingService } from '../../core/services/shopping-center-casing.service';
import { ShoppingCenterCasing } from '../../models/shopping-center-casing';
import { Store } from '../../models/store';

@Component({
  selector: 'mds-site-overview',
  templateUrl: './site-overview.component.html',
  styleUrls: ['./site-overview.component.css']
})
export class SiteOverviewComponent implements OnInit {

  readOnly = true;
  siteId: number;
  site: Site;
  selectedSCCasing: ShoppingCenterCasing;
  activeStore: Store;
  futureStore: Store;
  historicalStores: Store[];
  warningHasMultipleActiveStores = false;
  warningHasMultipleFutureStores = false;

  constructor(private _location: Location,
              private route: ActivatedRoute,
              private siteService: SiteService,
              private shoppingCenterCasingService: ShoppingCenterCasingService) { }

  ngOnInit() {
    this.siteId = parseInt(this.route.snapshot.paramMap.get('siteId'), 10);
    this.siteService.getOneById(this.siteId).subscribe(site => {
      this.site = site;
      console.log(site);
      this.historicalStores = [];
      this.site.stores.forEach(store => {
        if (store.storeType === 'ACTIVE') {
          if (this.activeStore != null) {
            this.warningHasMultipleActiveStores = true;
          }
          this.activeStore = store;
        } else if (store.storeType === 'FUTURE') {
          if (this.futureStore != null) {
            this.warningHasMultipleFutureStores = true;
          }
          this.futureStore = store;
        } else {
          this.historicalStores.push(store);
        }
      });
    });
  }

  goBack() {
    this._location.back();
  }

  onShoppingCenterCasingOpened(casing: SimplifiedShoppingCenterCasing) {
    this.shoppingCenterCasingService.getOneById(casing.id).subscribe(c => {
      this.selectedSCCasing = c;
      console.log(c);
    });
  }
}
