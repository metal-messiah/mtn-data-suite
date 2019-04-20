import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListManagerService } from './list-manager.service';
import { CustomMaterialModule } from '../material/custom-material.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    CustomMaterialModule,
    RouterModule,
    ReactiveFormsModule
  ],
  declarations: [],
  providers: [ListManagerService],
  exports: []
})
export class ListManagerModule { }
