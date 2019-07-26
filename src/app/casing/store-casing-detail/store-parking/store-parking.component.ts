import { Component, OnInit } from '@angular/core';
import { StoreCasingDetailService } from '../store-casing-detail.service';

@Component({
  selector: 'mds-store-parking',
  templateUrl: './store-parking.component.html',
  styleUrls: ['./store-parking.component.css', '../casing-defaults.css']
})
export class StoreParkingComponent implements OnInit {

  constructor(private service: StoreCasingDetailService) { }

  ngOnInit() {
  }

  get storeSurveyForm() {
    return this.service.storeSurveyForm;
  }

  get shoppingCenterCasingForm() {
    return this.service.shoppingCenterCasingForm;
  }

  get conditions() {
    return this.service.conditions;
  }

}
