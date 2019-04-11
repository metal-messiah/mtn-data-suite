import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { MapService } from 'app/core/services/map.service';
import { StoreService } from 'app/core/services/store.service';
import { DbEntityMarkerService } from 'app/core/services/db-entity-marker.service';
import { SiteMarker } from 'app/models/site-marker';
import { SiteService } from 'app/core/services/site.service';
import { SimplifiedSite } from 'app/models/simplified/simplified-site';
import * as _ from 'lodash';
import { Store } from 'app/models/full/store';
import { StoreMarker } from 'app/models/store-marker';
import { CasingDashboardService } from 'app/casing/casing-dashboard/casing-dashboard.service';

@Component({
  selector: 'mds-stores-list',
  templateUrl: './stores-list.component.html',
  styleUrls: ['./stores-list.component.css']
})
export class StoresListComponent implements OnInit, OnDestroy {
  private items: SiteMarker[] = [];

  subscriptions = [];

  @ViewChild('listOfStores') listOfStores;

  constructor(
    private storeService: StoreService,
    private mapService: MapService,
    private dbEntityMarkerService: DbEntityMarkerService,
    private siteService: SiteService,
    private casingDashboardService: CasingDashboardService
  ) { }

  ngOnInit() {
    if (!this.subscriptions.length) {
      console.log('push subscription', this.subscriptions)
      this.subscriptions.push(
        this.dbEntityMarkerService.visibleMarkersChanged$.subscribe((visibleMarkers: google.maps.Marker[]) => {

          this.items = [];

          visibleMarkers.forEach(m => {
            this.items.push(new SiteMarker(m['site']));
          });

          this.items = _.uniqBy(this.items, 'id');

          this.siteService.getAllByIds(this.items.map(item => item.id)).subscribe((sites: SimplifiedSite[]) => {
            sites.forEach(site => {
              const itemIdx = this.items.findIndex((i) => i.id === site.id)
              this.items[itemIdx] = Object.assign({}, this.items[itemIdx], site);
            })
          })
        })
      )
    }
  }

  ngOnDestroy() {
    console.log('destroy stores list')
    this.dbEntityMarkerService.onDestroy();
  }

  showOnMap(storeMarker: StoreMarker) {
    this.storeService.getOneById(storeMarker.id).subscribe((store: Store) => {
      this.mapService.setCenter({
        lat: store.site.latitude,
        lng: store.site.longitude
      });
    })
  }

  select(siteMarker: SiteMarker, storeMarker: StoreMarker) {
    this.casingDashboardService.selectItemProgrammatically(siteMarker.id, storeMarker.id)
  }

  getLogoPath(fileName: string) {
    return `https://res.cloudinary.com/mtn-retail-advisors/image/upload/c_limit,h_20/${fileName}`;
  }
}
