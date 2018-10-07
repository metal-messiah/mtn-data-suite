import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { ReportUploadComponent } from './report-upload/report-upload.component';
import { EditTotalSizeDialogComponent } from './edit-total-size-dialog/edit-total-size-dialog.component';
import { ReportModelDataComponent } from './report-model-data/report-model-data.component';
import { ReportBuilderService } from './services/report-builder.service';
import { HtmlToModelParser } from '../core/services/html-to-model-parser.service';
import { JsonToTablesService } from './services/json-to-tables.service';
import { HtmlDimensionsService } from '../core/services/html-dimensions.service';
import { ReportTablesComponent } from './report-tables/report-tables.component';

@NgModule({
  imports: [
    SharedModule,
    ReportsRoutingModule],
  declarations: [
    ReportsComponent,
    ReportUploadComponent,
    EditTotalSizeDialogComponent,
    ReportModelDataComponent,
    ReportTablesComponent],
  entryComponents: [
    EditTotalSizeDialogComponent],
  providers: [
    ReportBuilderService,
    HtmlToModelParser,
    JsonToTablesService,
    HtmlDimensionsService
  ]
})
export class ReportsModule {}
