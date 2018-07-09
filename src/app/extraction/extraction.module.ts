import { NgModule } from '@angular/core';

import { ExtractionRoutingModule } from './extraction-routing.module';
import { ExtractionComponent } from './extraction.component';
import { SharedModule } from '../shared/shared.module';
import { ExtractionMenuComponent } from './extraction-menu/extraction-menu.component';
import { ProjectExtractionComponent } from './project-extraction/project-extraction.component';
import { ExtractionService } from './extraction.service';

@NgModule({
  imports: [
    SharedModule,
    ExtractionRoutingModule
  ],
  declarations: [
    ExtractionComponent,
    ExtractionMenuComponent,
    ProjectExtractionComponent
  ],
  providers: [
    ExtractionService
  ]
})
export class ExtractionModule { }
