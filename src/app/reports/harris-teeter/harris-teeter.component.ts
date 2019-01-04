import { Component, OnInit } from '@angular/core';
import { ReportBuilderService } from '../services/report-builder.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JsonToTablesUtil } from '../report-tables/json-to-tables.util';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'mds-harris-teeter',
  templateUrl: './harris-teeter.component.html',
  styleUrls: ['./harris-teeter.component.css']
})
export class HarrisTeeterComponent implements OnInit {

  form: FormGroup;
  compChangeControls;

  scenarioOptions = ['Opening', 'Closed'];

  ratings = [
    {value: 1, display: 'Poor'},
    {value: 2, display: 'Fair'},
    {value: 3, display: 'Average'},
    {value: 4, display: 'Good'},
    {value: 5, display: 'Excellent'}
  ];

  constructor(private rbs: ReportBuilderService,
              public _location: Location,
              public router: Router,
              private fb: FormBuilder,
              private authService: AuthService,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    if (!this.rbs.reportTableData) {
      this.snackBar.open('No data has been loaded. Starting from the beginning', null, {duration: 5000});
      this.router.navigate(['reports']);
    } else {
      document.getElementById('reports-content-wrapper').scrollTop = 0;
      this.createForm();
    }
  }

  createForm() {
    this.form = this.fb.group({
      compChanges: this.fb.array(this.rbs.reportTableData.storeList
        .filter(s => s.scenario === 'Opening' || s.scenario === 'Closed')
        .map(s => {
          const fg = this.fb.group(s);
          fg.addControl('additionalText', this.fb.control(''));
          return fg;
        })),
      visibilityRating: this.fb.control('3'),
      ingressRating: this.fb.control('3'),
      egressRating: this.fb.control('3'),
      state: this.fb.control(''),
      reportTitle: this.fb.control(''),
      reportType: this.fb.control('Metro Market Study')
    });
    this.compChangeControls = (this.form.get('compChanges') as FormArray).controls;
  }

  private getAssumptions() {
    return (this.form.get('compChanges') as FormArray).controls.map(siControl => {
      const storeName = siControl.get('storeName').value;
      const location = siControl.get('location').value;
      const scenario = siControl.get('scenario').value;
      let additionalText = siControl.get('additionalText').value;
      if (additionalText) {
        additionalText = ' ' + additionalText;
      }
      const totalArea: number = siControl.get('totalArea').value;
      return `${storeName} at ${location.replace('/', 'in')}, ${scenario}${additionalText}, ${totalArea.toLocaleString()} TSQFT.`
    });
  }

  private getSite() {
    const store = this.rbs.reportTableData.storeList.find(s => s.mapKey === this.rbs.reportTableData.selectedMapKey);
    return {
      areaTotal: store.totalArea,
      intersection: store.location.split(' / ')[0],
      city: store.location.split(' / ')[1],
      state: this.form.get('state').value,
      latitude: store.latitude,
      longitude: store.longitude,
      ratings: {
        visibility: this.form.get('visibilityRating').value,
        ingress: this.form.get('ingressRating').value,
        egress: this.form.get('egressRating').value
      }
    }
  }

  private getImpactedSisterStores() {
    return this.rbs.reportTableData.storeList
      .filter(store => {
        return store.category === 'Company Store' && store.scenario !== 'Site' && store.scenario !== 'Exclude'
      })
      .sort((a, b) => {
        if (a.storeName === b.storeName) {
          return a.mapKey - b.mapKey;
        } else {
          return a.storeName.localeCompare(b.storeName);
        }
      })
      .map(store => {
        return {
          mapKey: store.mapKey,
          scenario: store.scenario,
          name: store.storeName,
          scenarioImpacts: {}
        }
      });
  }

  getHTReport() {
    const util = new JsonToTablesUtil(this.rbs);
    const reportData = util.getReportData();
    reportData['assumptions'] = this.getAssumptions();
    reportData['site'] = this.getSite();
    reportData['analyst'] = this.authService.sessionUser;
    reportData['reportTitle'] = this.form.get('reportTitle').value;
    reportData['reportType'] = this.form.get('reportType').value;
    reportData['impactedSisterStores'] = this.getImpactedSisterStores();
    reportData['scenarios'] = [{
      scenario: 'SCENARIO NAME',
      projectedFitImage: 'POWER',
      size: 'SIZE',
      year1Ending: 0,
      year2Ending: 0,
      year3Ending: 0
    }];

    console.log(reportData);
  }

}
