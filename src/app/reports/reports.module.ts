import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { ReportModelDataComponent } from './report-model-data/report-model-data.component';
import { ReportBuilderService } from './services/report-builder.service';
import { HtmlDimensionsService } from '../core/services/html-dimensions.service';
import { ReportTablesComponent } from './report-tables/report-tables.component';
import { SiteEvaluationComponent } from './site-evaluation/site-evaluation.component';
import { StoreCategorizationComponent } from './store-categorization/store-categorization.component';
import { StoreDataVerificationComponent } from './store-data-verification/store-data-verification.component';
import { ReportDownloadComponent } from './report-download/report-download.component';
import { HarrisTeeterComponent } from './harris-teeter/harris-teeter.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  imports: [
    SharedModule,
    ReportsRoutingModule,
    PdfViewerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    ReportsComponent,
    ReportModelDataComponent,
    ReportTablesComponent,
    SiteEvaluationComponent,
    StoreCategorizationComponent,
    StoreDataVerificationComponent,
    ReportDownloadComponent,
    HarrisTeeterComponent
  ],
  providers: [
    ReportBuilderService,
    HtmlDimensionsService
  ]
})
export class ReportsModule {
}
