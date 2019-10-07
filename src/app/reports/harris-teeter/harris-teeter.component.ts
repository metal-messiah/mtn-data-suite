import { Component, ElementRef, OnInit } from '@angular/core';
import { ReportBuilderService } from '../services/report-builder.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { JsonToTablesUtil } from '../report-tables/json-to-tables.util';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';
import { saveAs } from 'file-saver';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'mds-harris-teeter',
  templateUrl: './harris-teeter.component.html',
  styleUrls: ['./harris-teeter.component.css', '../shared-report-style.css']
})
export class HarrisTeeterComponent implements OnInit {

  downloading = false;

  form: FormGroup;
  compChangeControls;

  scenarioOptions = ['Opening', 'Closed'];

  reportData;

  ratings = [
    {placeholder: 'Visibility Rating', formControlName: 'visibilityRating'},
    {placeholder: 'Ingress Rating', formControlName: 'ingressRating'},
    {placeholder: 'Egress Rating', formControlName: 'egressRating'}
  ];

  ratingValues = [
    {value: 1, display: 'Poor'},
    {value: 2, display: 'Fair'},
    {value: 3, display: 'Average'},
    {value: 4, display: 'Good'},
    {value: 5, display: 'Excellent'}
  ];

  constructor(private rbs: ReportBuilderService,
              private router: Router,
              private fb: FormBuilder,
              private errorService: ErrorService,
              private authService: AuthService,
              private snackBar: MatSnackBar,
              private host: ElementRef) {
  }

  ngOnInit() {
    if (!this.rbs.getReportTableData()) {
      this.snackBar.open('No data has been loaded. Starting from the beginning', null, {duration: 2000});
      this.router.navigate(['reports']);
    } else {
      this.host.nativeElement.scrollTop = 0;
      const util = new JsonToTablesUtil(this.rbs);
      this.reportData = util.getReportData();
      this.createForm();
    }
  }

  createForm() {
    this.form = this.fb.group({
      compChanges: this.fb.array(this.rbs.getReportTableData().storeList
        .filter(store => store.scenario === 'Opening' || store.scenario === 'Closed')
        .map(store => {
          const fg = this.fb.group(store);
          fg.addControl('includeInReport', this.fb.control(this.isIncludedInSOV(store.mapKey)));
          fg.addControl('additionalText', this.fb.control(''));
          return fg;
        })),
      visibilityRating: this.fb.control(3),
      ingressRating: this.fb.control(3),
      egressRating: this.fb.control(3),
      state: this.fb.control(''),
    });
    this.compChangeControls = (this.form.get('compChanges') as FormArray).controls;
  }

  isIncludedInSOV(mapKey) {
    return this.reportData.sovData.proposedCompetition.find(store => store.mapKey === mapKey);
  }

  private getAssumptions() {
    return (this.form.get('compChanges') as FormArray).controls
      .filter(storeControl => storeControl.get('includeInReport').value)
      .map(siControl => {
        const storeName = siControl.get('storeName').value;
        const location = siControl.get('location').value;
        const scenario = siControl.get('scenario').value;
        let additionalText = siControl.get('additionalText').value;
        if (additionalText) {
          additionalText = ' ' + additionalText;
        }
        const totalArea: number = siControl.get('totalArea').value;
        return `${storeName} at ${location.replace('/', 'in')}, ${scenario}${additionalText}, ${totalArea.toLocaleString()} TSQFT.`;
      });
  }

  private getSite() {
    const store = this.rbs.getReportTableData().storeList.find(s => s.mapKey === this.rbs.getReportTableData().selectedMapKey);
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
    };
  }

  private getImpactedSisterStores(reportData) {
    return reportData.sovData.companyStores
      .filter(store => !store.isSite)
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
          name: store.storeName,
          scenarioImpacts: {
            'S1 A': store.contributionDollars
          }
        };
      });
  }

  getHTReport() {
    const metaData = this.rbs.getReportMetaData();
    this.reportData['assumptions'] = this.getAssumptions();
    this.reportData['site'] = this.getSite();
    this.reportData['analyst'] = this.authService.sessionUser;
    this.reportData['reportTitle'] = metaData.modelName;
    this.reportData['reportType'] = metaData.type;
    this.reportData['impactedSisterStores'] = this.getImpactedSisterStores(this.reportData);
    this.reportData['scenarios'] = [{
      scenario: 'S1 A',
      projectedFitImage: this.reportData.projections.power,
      size: this.reportData.projections.totalArea,
      year1Ending: this.reportData.projections.firstYearEndingSales,
      year2Ending: this.reportData.projections.secondYearEndingSales,
      year3Ending: this.reportData.projections.thirdYearEndingSales
    }];

    this.downloading = true;
    this.rbs.getHTReport(this.reportData)
      .pipe(finalize(() => this.downloading = false))
      .subscribe(res => {
          saveAs(res.body, `${metaData.modelName}.pdf`);
          this.router.navigate(['reports/download']);
        },
        err => {
          this.rbs.compilingReport = false;
          this.errorService.handleServerError('Failed get pdf', err, () => console.log(err));
        });
  }

}
