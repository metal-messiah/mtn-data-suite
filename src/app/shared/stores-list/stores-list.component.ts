import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';

import * as _ from 'lodash';
import { StoreMarker } from 'app/models/store-marker';
import { StoreSidenavService, SortType, SortDirection } from '../../shared/store-sidenav/store-sidenav.service';
import { SiteMarker } from 'app/models/site-marker';
import { SiteService } from 'app/core/services/site.service';
import { Site } from 'app/models/full/site';


@Component({
  selector: 'mds-stores-list',
  templateUrl: './stores-list.component.html',
  styleUrls: ['./stores-list.component.css']
})
export class StoresListComponent implements OnInit {

  sortType: SortType;
  sortDirection: SortDirection;


  @ViewChild('listOfStores') listOfStores;

  constructor(
    private storeSidenavService: StoreSidenavService,
    private siteService: SiteService
  ) { }

  ngOnInit() {
    this.storeSidenavService.sortType$.subscribe((sortType: SortType) => {
      this.sortType = sortType;
    })

    this.storeSidenavService.sortDirection$.subscribe((sortDirection: SortDirection) => {
      this.sortDirection = sortDirection;
    })

    this.storeSidenavService.scrollToMapSelectionId$.subscribe((id: number) => {
      this.scrollToElem(id);
    })



  }

  getItemIndex(i: number) {
    return `render_${i}`;
  }






  scrollToElem(id) {
    const elem = document.getElementById(`${id}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  isFetching() {
    return this.storeSidenavService.getFetching();
  }

  getItems() {
    // return this.storeSidenavService.getItems();
    return this.storeSidenavService.getRenderer();
  }

  getSortType() {
    return this.storeSidenavService.getSortType();
  }

  setSortType(sortType: SortType) {
    this.storeSidenavService.setSortType(sortType);
  }

  getSortGroups() {
    return this.storeSidenavService.getSortGroups();
  }

  setSortOptions(sortType?: SortType, sortDirection?: SortDirection) {
    this.storeSidenavService.setSortOptions(sortType, sortDirection)
  }

  getStoreSubtext(item: any, store: StoreMarker) {
    return this.storeSidenavService.getStoreSubtext(item, store);
  }

  getFormattedIntersection(site: Site) {
    return this.siteService.getFormattedIntersection(site);
  }

  getLogoPath(fileName: string) {
    return `https://res.cloudinary.com/mtn-retail-advisors/image/upload/c_limit,h_20/${fileName}`;
  }

  getAddressLabel(item: any) {
    const { address1, city, state } = item;
    if (address1 && city && state) {
      return `${address1}, ${city}, ${state}`
    }
    if (city && state) {
      return `${city}, ${state}`
    }
    if (state) {
      return `${state}`
    }
    return '';
  }

  getIdForElem(site: SiteMarker, store: StoreMarker): string {
    return store.isEmpty ? `empty_${site.id}` : `${store.id}`;
  }

  shouldHighlight(store: StoreMarker) {

    return this.storeSidenavService.getMapSelections().selectedStoreIds.has(store.id)
  }

  select(siteMarker: SiteMarker, storeMarker: StoreMarker) {
    this.storeSidenavService.select(siteMarker, storeMarker);
  }

  showOnMap(site: SiteMarker) {
    this.storeSidenavService.showOnMap(site);
  }
}
