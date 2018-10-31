import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/services/auth.guard';

import { ReportsComponent } from './reports.component';
import { ReportModelDataComponent } from './report-model-data/report-model-data.component';
import { StoreCategorizationComponent } from './store-categorization/store-categorization.component';
import { StoreDataVerificationComponent } from './store-data-verification/store-data-verification.component';
import { SiteEvaluationComponent } from './site-evaluation/site-evaluation.component';
import { ReportTablesComponent } from './report-tables/report-tables.component';
import { ReportDownloadComponent } from './download/report-download.component';

const routes: Routes = [
  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', component: ReportModelDataComponent},
      {path: 'categorization', component: StoreCategorizationComponent},
      {path: 'data-verification', component: StoreDataVerificationComponent},
      {path: 'site-evaluation', component: SiteEvaluationComponent},
      {path: 'table-preview', component: ReportTablesComponent},
      {path: 'download', component: ReportDownloadComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule {
}
