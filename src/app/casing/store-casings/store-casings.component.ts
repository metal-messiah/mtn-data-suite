import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../../core/services/store.service';
import { SimplifiedStoreCasing } from '../../models/simplified-store-casing';

@Component({
  selector: 'mds-store-casings',
  templateUrl: './store-casings.component.html',
  styleUrls: ['./store-casings.component.css']
})
export class StoreCasingsComponent implements OnInit {

  loading = false;
  casings: SimplifiedStoreCasing[];

  constructor(private storeService: StoreService,
              private route: ActivatedRoute,
              private _location: Location) {
  }

  ngOnInit() {
    const storeId = parseInt(this.route.snapshot.paramMap.get('storeId'), 10);

    this.loading = true;
    this.storeService.getCasingsByStoreId(storeId)
      .finally(() => this.loading = false)
      .subscribe((casings: SimplifiedStoreCasing[]) => {
        this.casings = casings;
        console.log(casings);
      });
  }

  goBack(): void {
    this._location.back();
  };

}
