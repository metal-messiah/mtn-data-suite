import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { ReportUploadComponent } from './report-upload/report-upload.component';
import { EditTotalSizeDialogComponent } from './edit-total-size-dialog/edit-total-size-dialog.component';

@NgModule({
  imports: [SharedModule, ReportsRoutingModule],
  declarations: [ReportsComponent, ReportUploadComponent, EditTotalSizeDialogComponent],
  entryComponents: [EditTotalSizeDialogComponent],
  providers: []
})
export class ReportsModule {}
