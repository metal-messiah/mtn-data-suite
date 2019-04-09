import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { StoreListService } from 'app/core/services/store-list.service';
import { StoreList } from 'app/models/full/store-list';
import { MatDialog } from '@angular/material';
import { ListManagerService } from '../list-manager.service';
import { MapService } from 'app/core/services/map.service';

@Component({
  selector: 'mds-storelist-stores-list',
  templateUrl: './storelist-stores-list.component.html',
  styleUrls: ['./storelist-stores-list.component.css']
})
export class StorelistStoresListComponent implements OnInit {
  storeList: StoreList;

  loadingConstraint = 100;
  storesForRender: SimplifiedStore[] = [];

  @ViewChild('listOfStores') listOfStores;

  constructor(
    private listManagerService: ListManagerService,
    private storeListService: StoreListService,
    protected dialog: MatDialog,
    private mapService: MapService

  ) { }

  ngOnInit() { }

  get selectedStoreList(): StoreList {
    return this.storeList;
  }

  @Input()
  set selectedStoreList(storeList: StoreList) {
    this.storeListService
      .getOneById(storeList.id)
      .subscribe((fullStoreList: StoreList) => {
        this.storeList = fullStoreList;
        this.updateStoresForRender();
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

  updateStoresForRender() {
    const index = this.storesForRender.length;
    if (index < this.storeList.stores.length) {
      const additionalRenders = this.storeList.stores.slice(index, index + this.loadingConstraint);
      this.storesForRender = this.storesForRender.concat(additionalRenders);
    }
  }

  reachedBottom(e) {
    const elem = document.getElementById('listOfStores');
    if (elem.offsetHeight + elem.scrollTop >= elem.scrollHeight) {
      this.updateStoresForRender()
    }
  }


}
