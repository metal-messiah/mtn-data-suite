import { Component, Input, OnInit } from '@angular/core';
import { ShoppingCenterSurvey } from '../../models/full/shopping-center-survey';

@Component({
  selector: 'mds-shopping-center-survey-form',
  templateUrl: './shopping-center-survey-form.component.html',
  styleUrls: ['./shopping-center-survey-form.component.css']
})
export class ShoppingCenterSurveyFormComponent implements OnInit {

  @Input() survey: ShoppingCenterSurvey;
  @Input() isDisabled = true;

  constructor() { }

  ngOnInit() {
  }

}
