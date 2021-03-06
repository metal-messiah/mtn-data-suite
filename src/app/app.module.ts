import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppComponent } from './app.component';

import { environment } from '../environments/environment';
import { AdministrationModule } from './administration/administration.module';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { HomeComponent } from './home/home.component';
import { SharedModule } from './shared/shared.module';
import { CasingModule } from './casing/casing.module';
import { DataUploadModule } from './data-upload/data-upload.module';
import { ExtractionModule } from './extraction/extraction.module';
import { ReportsModule } from './reports/reports.module';
import { BrokerageModule } from './brokerage/brokerage.module';
import { GeocodingModule } from './geocoding/geocoding.module';
import { SiteWiseModule } from './site-wise/site-wise.module';
import { AuthenticationComponent } from './authentication/authentication.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('/ngsw-worker.js', {
      enabled: environment.production
    }),
    CoreModule,
    SharedModule,
    AdministrationModule,
    CasingModule,
    DataUploadModule,
    ExtractionModule,
    ReportsModule,
    BrokerageModule,
    GeocodingModule,
    SiteWiseModule,
    AppRoutingModule // must come last?
  ],
  declarations: [AppComponent, HomeComponent, AuthenticationComponent],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
