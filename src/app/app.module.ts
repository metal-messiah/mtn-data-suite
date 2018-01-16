import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {ServiceWorkerModule} from '@angular/service-worker';

import {AppComponent} from './app.component';

import {environment} from '../environments/environment';
import {AdministrationModule} from './administration/administration.module';
import {AppRoutingModule} from './app-routing.module';
import {CoreModule} from './core/core.module';
import {HomeComponent} from './home/home.component';
import {SharedModule} from './shared/shared.module';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    environment.production ? ServiceWorkerModule.register('/ngsw-worker.js') : [],
    CoreModule,
    SharedModule,
    AdministrationModule,
    AppRoutingModule
  ],
  declarations: [AppComponent, HomeComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
