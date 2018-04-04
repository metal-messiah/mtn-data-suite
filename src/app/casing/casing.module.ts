import { NgModule } from '@angular/core';
import { CasingDashboardComponent } from './casing-dashboard/casing-dashboard.component';
import { CasingComponent } from './casing/casing.component';
import { SharedModule } from '../shared/shared.module';
import { CasingRoutingModule } from './casing-routing.module';

@NgModule({
  imports: [
    SharedModule,
    CasingRoutingModule
  ],
  declarations: [
    CasingComponent,
    CasingDashboardComponent
  ]
})
export class CasingModule {
}
