import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListManagerService } from './list-manager.service';
import { StorelistListItemComponent } from './storelist-list-item/storelist-list-item.component';
import { StorelistSubscribersListComponent } from '../list-manager-dialog/storelist-subscribers-list/storelist-subscribers-list.component';
import { StorelistStoresListComponent } from '../list-manager-dialog/storelist-stores-list/storelist-stores-list.component';
import { ListManagerComponent } from './list-manager.component';
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
  declarations: [ListManagerComponent, StorelistListItemComponent, StorelistSubscribersListComponent, StorelistStoresListComponent],
  providers: [ListManagerService],
  exports: [CustomMaterialModule, ListManagerComponent, StorelistListItemComponent, StorelistSubscribersListComponent, StorelistStoresListComponent]
})
export class ListManagerModule { }
