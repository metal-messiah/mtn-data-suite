import { NgModule } from '@angular/core';

import { ExtractionRoutingModule } from './extraction-routing.module';
import { ExtractionComponent } from './extraction.component';
import { SharedModule } from '../shared/shared.module';
import { ExtractionMenuComponent } from './extraction-menu/extraction-menu.component';
import { ProjectExtractionComponent } from './project-extraction/project-extraction.component';

@NgModule({
  imports: [
    SharedModule,
    ExtractionRoutingModule
  ],
  declarations: [
    ExtractionComponent,
    ExtractionMenuComponent,
    ProjectExtractionComponent
  ]
})
export class ExtractionModule { }
