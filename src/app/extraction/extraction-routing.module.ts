import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExtractionComponent } from './extraction.component';
import { AuthGuard } from '../core/services/auth.guard';
import { ExtractionMenuComponent } from './extraction-menu/extraction-menu.component';
import { ProjectExtractionComponent } from './project-extraction/project-extraction.component';

const routes: Routes = [
  {
    path: 'extraction',
    component: ExtractionComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', component: ExtractionMenuComponent},
      {path: 'by-project', component: ProjectExtractionComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExtractionRoutingModule {
}
