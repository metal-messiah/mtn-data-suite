import { Component, OnInit } from '@angular/core';
import { AccessListDialogComponent } from '../../access-list-dialog/access-list-dialog.component';
import { MatDialog } from '@angular/material';
import { StoreCasingDetailService } from '../store-casing-detail.service';

@Component({
  selector: 'mds-accessibility',
  templateUrl: './accessibility.component.html',
  styleUrls: ['./accessibility.component.css']
})
export class AccessibilityComponent implements OnInit {


  constructor(private dialog: MatDialog,
              private service: StoreCasingDetailService) { }

  ngOnInit() {
  }

  get storeSurveyForm() {
    return this.service.storeSurveyForm;
  }

  openAccessDialog() {
    const data = {shoppingCenterSurveyId: this.service.shoppingCenterSurvey.id};
    this.dialog.open(AccessListDialogComponent, {data: data, maxWidth: '90%', disableClose: true});
  }

  get conditions() {
    return this.service.conditions;
  }

}
