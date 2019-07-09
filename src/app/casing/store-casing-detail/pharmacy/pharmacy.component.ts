import { Component, OnInit } from '@angular/core';
import { StoreCasingDetailService } from '../store-casing-detail.service';

@Component({
  selector: 'mds-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.css']
})
export class PharmacyComponent implements OnInit {

  constructor(private service: StoreCasingDetailService) { }

  ngOnInit() {
  }

  get storeSurveyForm() {
    return this.service.storeSurveyForm;
  }

}
