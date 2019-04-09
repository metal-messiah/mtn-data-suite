import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { ListManagerService } from '../list-manager.service';
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

  ) { }

  ngOnChanges(changes) {
  }

  unsubscribe(subscriber: SimplifiedUserProfile) {
    this.listManagerService.unsubscribe(subscriber, this.storeList);
  }

}
