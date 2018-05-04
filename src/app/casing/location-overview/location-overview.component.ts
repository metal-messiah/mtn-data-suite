import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/site';
import { SimplifiedShoppingCenterCasing } from '../../models/simplified-shopping-center-casing';
import { ShoppingCenterCasingService } from '../../core/services/shopping-center-casing.service';
import { ShoppingCenterCasing } from '../../models/shopping-center-casing';

@Component({
  selector: 'mds-location-overview',
  templateUrl: './location-overview.component.html',
  styleUrls: ['./location-overview.component.css']
})
export class LocationOverviewComponent implements OnInit {

  siteId: number;
  site: Site;
  selectedSCCasing: ShoppingCenterCasing;

  constructor(private _location: Location,
              private route: ActivatedRoute,
              private siteService: SiteService,
              private shoppingCenterCasingService: ShoppingCenterCasingService) { }

  ngOnInit() {
    this.siteId = parseInt(this.route.snapshot.paramMap.get('siteId'), 10);
    this.siteService.getOneById(this.siteId).subscribe(site => {
      this.site = site;
      console.log(site);
    });
  }

  goBack() {
    this._location.back();
  }

  casingOpened(casing: SimplifiedShoppingCenterCasing) {
    this.shoppingCenterCasingService.getOneById(casing.id).subscribe(c => {
      this.selectedSCCasing = c;
      console.log(c);
    });
  }
}
