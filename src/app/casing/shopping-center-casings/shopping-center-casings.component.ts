import { Component, OnInit } from '@angular/core';
import { Pageable } from '../../models/pageable';
import { ShoppingCenterCasing } from '../../models/shopping-center-casing';
import { ShoppingCenterService } from '../../core/services/shopping-center.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SimplifiedShoppingCenterCasing } from '../../models/simplified-shopping-center-casing';
import { Location } from '@angular/common';

@Component({
  selector: 'mds-shopping-center-casings',
  templateUrl: './shopping-center-casings.component.html',
  styleUrls: ['./shopping-center-casings.component.css']
})
export class ShoppingCenterCasingsComponent implements OnInit {

  loading = false;
  casings: SimplifiedShoppingCenterCasing[];

  constructor(private shoppingCenterService: ShoppingCenterService,
              private route: ActivatedRoute,
              private _location: Location) {
  }

  ngOnInit() {
    const shoppingCenterId = parseInt(this.route.snapshot.paramMap.get('shoppingCenterId'), 10);

    this.loading = true;
    this.shoppingCenterService.getCasingsByShoppingCenterId(shoppingCenterId)
      .finally(() => this.loading = false)
      .subscribe((casings: SimplifiedShoppingCenterCasing[]) => {
        this.casings = casings;
      });
  }

  goBack(): void {
    this._location.back();
  };

}
