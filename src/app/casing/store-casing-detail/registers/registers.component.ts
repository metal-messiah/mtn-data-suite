import { Component, OnInit } from '@angular/core';
import { StoreCasingDetailService } from '../store-casing-detail.service';

@Component({
  selector: 'mds-registers',
  templateUrl: './registers.component.html',
  styleUrls: ['./registers.component.css']
})
export class RegistersComponent implements OnInit {

  constructor(private service: StoreCasingDetailService) { }

  ngOnInit() {
  }

  get storeSurveyForm() {
    return this.service.storeSurveyForm;
  }

}
