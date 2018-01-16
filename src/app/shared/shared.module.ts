import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {ErrorDialogComponent} from './error-dialog/error-dialog.component';
import {ConfirmDialogComponent} from './confirm-dialog/confirm-dialog.component';
import {CustomMaterialModule} from './material/custom-material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {BreakpointObserver, MediaMatcher} from '@angular/cdk/layout';
import {CallbackComponent} from './callback/callback.component';
import {PathNotFoundComponent} from './path-not-found/path-not-found.component';

@NgModule({
  imports: [
    CommonModule,
    CustomMaterialModule
  ],
  declarations: [
    ErrorDialogComponent,
    ConfirmDialogComponent,
    CallbackComponent,
    PathNotFoundComponent
  ],
  providers: [
    BreakpointObserver,
    DatePipe,
    MediaMatcher
  ],
  entryComponents: [
    ErrorDialogComponent,
    ConfirmDialogComponent
  ],
  exports: [
    CallbackComponent,
    CommonModule,
    CustomMaterialModule,
    DatePipe,
    FormsModule,
    HttpClientModule,
    PathNotFoundComponent,
    ReactiveFormsModule,
  ]
})
export class SharedModule {
}
