import { Component, OnInit, Input } from '@angular/core';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { StoreService } from 'app/core/services/store.service';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { StoreListService } from 'app/core/services/store-list.service';
import { StoreList } from 'app/models/full/store-list';
import { MatDialog } from '@angular/material';
import { ListManagerDialogComponent } from '../list-manager-dialog.component';
import { ListManagerService } from '../list-manager.service';
import { MapService } from 'app/core/services/map.service';

@Component({
  selector: 'mds-storelist-stores-list',
  templateUrl: './storelist-stores-list.component.html',
  styleUrls: ['./storelist-stores-list.component.css']
})
export class StorelistStoresListComponent implements OnInit {
  storeList: StoreList;

  constructor(
    private listManagerService: ListManagerService,
    private storeListService: StoreListService,
    protected dialog: MatDialog,
    private mapService: MapService
    
  ) {}

  ngOnInit() {}

  get selectedStoreList(): StoreList {
    return this.storeList;
  }

  @Input()
  set selectedStoreList(storeList: StoreList) {
    this.storeListService
      .getOneById(storeList.id)
      .subscribe((fullStoreList: StoreList) => {
        this.storeList = fullStoreList;
      });
  }

  setStore(store: SimplifiedStore) {
    this.listManagerService.setStores([store]);
  }

  removeStoreFromList(store: SimplifiedStore) {
    this.listManagerService.removeFromList(
      [new SimplifiedStoreList(this.storeList)],
      [store]
    );
  }

  showOnMap(store: SimplifiedStore) {
    this.mapService.setCenter({
      lat: store.site.latitude,
      lng: store.site.longitude
    });
  }
}
