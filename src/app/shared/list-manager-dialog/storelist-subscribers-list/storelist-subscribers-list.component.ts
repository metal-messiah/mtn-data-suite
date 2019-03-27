import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { StoreService } from 'app/core/services/store.service';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { StoreListService } from 'app/core/services/store-list.service';
import { StoreList } from 'app/models/full/store-list';
import { MatDialog } from '@angular/material';
import { ListManagerDialogComponent } from '../list-manager-dialog.component';
import { ListManagerService } from '../list-manager.service';
import { MapService } from 'app/core/services/map.service';
import { SimplifiedUserProfile } from 'app/models/simplified/simplified-user-profile';

@Component({
  selector: 'mds-storelist-subscribers-list',
  templateUrl: './storelist-subscribers-list.component.html',
  styleUrls: ['./storelist-subscribers-list.component.css']
})
export class StorelistSubscribersListComponent implements OnChanges {
  @Input() storeList: SimplifiedStoreList;

  constructor(
    private listManagerService: ListManagerService,
    
  ) {}

  ngOnChanges(changes) {
  }

  unsubscribe(subscriber: SimplifiedUserProfile) {
    this.listManagerService.unsubscribe(subscriber, this.storeList);
  }
  
}
