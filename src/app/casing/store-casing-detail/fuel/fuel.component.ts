import { Component, OnInit } from '@angular/core';
import { StoreCasingDetailService } from '../store-casing-detail.service';

@Component({
  selector: 'mds-fuel',
  templateUrl: './fuel.component.html',
  styleUrls: ['./fuel.component.css']
})
export class FuelComponent implements OnInit {

  constructor(private service: StoreCasingDetailService) { }

  ngOnInit() {
  }

  get storeCasingForm() {
    return this.service.storeCasingForm;
  }

  get storeSurveyForm() {
    return this.service.storeSurveyForm;
  }
}
