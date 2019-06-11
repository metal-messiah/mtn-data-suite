import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EntitySelectionService } from '../../../core/services/entity-selection.service';
import { map } from 'rxjs/operators';
import { SimplifiedStore } from '../../../models/simplified/simplified-store';
import { Coordinates } from '../../../models/coordinates';
import { SimplifiedSite } from '../../../models/simplified/simplified-site';
import { forkJoin } from 'rxjs';
import { StoreService } from '../../../core/services/store.service';
import { SiteService } from '../../../core/services/site.service';
import { MapService } from '../../../core/services/map.service';
import { CasingDashboardMode } from '../../../casing/enums/casing-dashboard-mode';
import { CasingDashboardService } from '../../../casing/casing-dashboard/casing-dashboard.service';
import { StoreSidenavService } from '../store-sidenav.service';
import { DbEntityMarkerService } from '../../../core/services/db-entity-marker.service';
import { SiteMarker } from '../../../models/site-marker';

@Component({
  selector: 'mds-sidenav-stores-on-map',
  templateUrl: './sidenav-stores-on-map.component.html',
  styleUrls: ['./sidenav-stores-on-map.component.css']
})
export class SidenavStoresOnMapComponent implements OnInit {

  siteMarkers: SiteMarker[] = [];

  constructor(private router: Router,
              private storeService: StoreService,
              private siteService: SiteService,
              private mapService: MapService,
              private dbEntityMarkerService: DbEntityMarkerService,
              private casingDashboardService: CasingDashboardService,
              private storeSidenavService: StoreSidenavService,
              private selectionService: EntitySelectionService) { }

  ngOnInit() {
    this.siteMarkers = this.dbEntityMarkerService.getVisibleSiteMarkers();
    this.dbEntityMarkerService.visibleMarkersChanged$.subscribe(() => {
      this.siteMarkers = this.dbEntityMarkerService.getVisibleSiteMarkers();
    });
    console.log('inited');
  }

  goBack() {
    this.router.navigate(['casing'], {skipLocationChange: true});
  }

  isMultiSelect() {
    return this.casingDashboardService.getSelectedDashboardMode() === CasingDashboardMode.MULTI_SELECT;
  }

  selectAllVisible() {
    // TODO implement
    // const visibleStoreIds = this.storeSidenavService.getVisibleStoreIds();
    // this.selectionService.selectByIds({siteIds: [], storeIds: visibleStoreIds});
  }

  getSelectedStoresCount(): number {
    return this.selectionService.storeIds.size;
  }

  zoomToSelection() {
    const requests = [];
    if (this.selectionService.storeIds.size) {
      requests.push(this.storeService.getAllByIds(Array.from(this.selectionService.storeIds))
        .pipe(map((stores: SimplifiedStore[]) =>
          stores.map((s: SimplifiedStore) => new Coordinates(s.site.latitude, s.site.longitude)))));
    }
    if (this.selectionService.siteIds.size) {
      requests.push(this.siteService.getAllByIds(Array.from(this.selectionService.siteIds))
        .pipe(map((sites: SimplifiedSite[]) =>
          sites.map((s: SimplifiedSite) => new Coordinates(s.latitude, s.longitude)))));
    }

    forkJoin(requests).subscribe(results => {
      const points = [].concat(...results);
      this.mapService.fitToPoints(points);
    });
  }
}
