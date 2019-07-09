import { Component, OnInit } from '@angular/core';
import { StoreCasingDetailService } from '../store-casing-detail.service';

@Component({
  selector: 'mds-store-condition',
  templateUrl: './store-condition.component.html',
  styleUrls: ['./store-condition.component.css', '../casing-defaults.css']
})
export class StoreConditionComponent implements OnInit {

  constructor(private service: StoreCasingDetailService) { }

  ngOnInit() {
  }

  get shoppingCenterCasingForm() {
    return this.service.shoppingCenterCasingForm;
  }

  get storeCasingForm() {
    return this.service.storeCasingForm;
  }

  get conditions() {
    return this.service.conditions;
  }

}
