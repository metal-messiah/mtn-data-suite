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
import { CasingDashboardService } from '../../../casing/casing-dashboard/casing-dashboard.service';
import { StoreListUIService } from '../store-list-u-i.service';
import { DbEntityMarkerService } from '../../../core/services/db-entity-marker.service';

@Component({
  selector: 'mds-sidenav-stores-on-map',
  templateUrl: './sidenav-stores-on-map.component.html',
  styleUrls: ['./sidenav-stores-on-map.component.css'],
  providers: [StoreListUIService]
})
export class SidenavStoresOnMapComponent implements OnInit {

  constructor(private router: Router,
              private storeService: StoreService,
              private siteService: SiteService,
              private mapService: MapService,
              private dbEntityMarkerService: DbEntityMarkerService,
              private casingDashboardService: CasingDashboardService,
              private storeListUIService: StoreListUIService,
              private selectionService: EntitySelectionService) { }

  ngOnInit() {
    this.storeListUIService.setSiteMarkers(this.dbEntityMarkerService.getVisibleSiteMarkers(), this.dbEntityMarkerService.controls);
    this.dbEntityMarkerService.visibleMarkersChanged$.subscribe(() => {
      this.storeListUIService.setSiteMarkers(this.dbEntityMarkerService.getVisibleSiteMarkers(), this.dbEntityMarkerService.controls);
    });
  }

  goBack() {
    this.router.navigate(['casing'], {skipLocationChange: true});
  }

  getSelectedStoresCount(): number {
    return this.selectionService.storeIds.size;
  }

  enableMultiSelect() {
    this.selectionService.setMultiSelect(true);
  }

  isMultiSelecting() {
    return this.selectionService.isMultiSelecting();
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
