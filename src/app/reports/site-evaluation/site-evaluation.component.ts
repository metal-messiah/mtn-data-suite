import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReportBuilderService } from '../services/report-builder.service';

@Component({
  selector: 'mds-site-evaluation',
  templateUrl: './site-evaluation.component.html',
  styleUrls: ['./site-evaluation.component.css']
})
export class SiteEvaluationComponent implements OnInit {

  form: FormGroup;

  readonly ratingOptions = ['Excellent', 'Good', 'Average', 'Fair', 'Poor'];

  constructor(private fb: FormBuilder,
              private reportBuilderService: ReportBuilderService) {
  }

  ngOnInit() {
    this.createForm();
  }

  private createForm() {
    this.form = this.fb.group({
      streetConditions: '',
      comments: '',
      trafficControls: '',
      cotenants: '',
      accessNorth: '',
      accessSouth: '',
      accessEast: '',
      accessWest: '',
      ingressEgress: '',
      visibilityNorth: '',
      visibilitySouth: '',
      visibilityEast: '',
      visibilityWest: '',
      populationDensityNorth: '',
      populationDensitySouth: '',
      populationDensityEast: '',
      populationDensityWest: '',
    });
  }

  next() {
    this.reportBuilderService.setSiteEvaluationData(this.form.value);
  }

}
