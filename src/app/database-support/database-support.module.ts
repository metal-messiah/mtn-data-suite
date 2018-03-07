import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { DatabaseSupportComponent } from './database-support/database-support.component';
import { AdministrationRoutingModule } from './database-support-routing.module';

@NgModule({
  imports: [
    SharedModule,
    AdministrationRoutingModule
  ],
  declarations: [DatabaseSupportComponent]
})

export class DatabaseSupportModule { }
