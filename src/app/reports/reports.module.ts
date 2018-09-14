import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { ReportUploadComponent } from './report-upload/report-upload.component';

@NgModule({
  imports: [SharedModule, ReportsRoutingModule],
  declarations: [
    ReportsComponent,
    ReportUploadComponent
  ],
  entryComponents: [],
  providers: []
})
export class ReportsModule {}
