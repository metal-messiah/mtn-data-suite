import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { EditTotalSizeDialogComponent } from './edit-total-size-dialog/edit-total-size-dialog.component';
import { ReportModelDataComponent } from './report-model-data/report-model-data.component';
import { ReportBuilderService } from './services/report-builder.service';
import { HtmlDimensionsService } from '../core/services/html-dimensions.service';
import { ReportTablesComponent } from './report-tables/report-tables.component';
import { SiteEvaluationComponent } from './site-evaluation/site-evaluation.component';
import { StoreCategorizationComponent } from './store-categorization/store-categorization.component';
import { StoreDataVerificationComponent } from './store-data-verification/store-data-verification.component';
import { ReportDownloadComponent } from './download/report-download.component';

@NgModule({
  imports: [
    SharedModule,
    ReportsRoutingModule
  ],
  declarations: [
    ReportsComponent,
    EditTotalSizeDialogComponent,
    ReportModelDataComponent,
    ReportTablesComponent,
    SiteEvaluationComponent,
    StoreCategorizationComponent,
    StoreDataVerificationComponent,
    ReportDownloadComponent
  ],
  entryComponents: [
    EditTotalSizeDialogComponent
  ],
  providers: [
    ReportBuilderService,
    HtmlDimensionsService
  ]
})
export class ReportsModule {
}
