import { Injectable } from '@angular/core';
import { SiteMarker } from '../../models/site-marker';
import { MarkerShape } from '../functionalEnums/MarkerShape';
import { Color } from '../functionalEnums/Color';
import { AuthService } from './auth.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';
import { RestService } from './rest.service';
import * as MarkerClusterer from '@google/markerclusterer';
import { StoreMarker } from '../../models/store-marker';
import { Subject } from 'rxjs';
import { Pageable } from '../../models/pageable';

@Injectable()
export class DbEntityMarkerService {

  private readonly endpoint = '/api/map-marker';

  private mapMarkers: google.maps.Marker[] = [];
  private clusterer: MarkerClusterer;

  public clickListener$ = new Subject<{ storeId: number, siteId: number }>();

  controls = {
    showActive: true,
    showHistorical: true,
    showFuture: true,
    showEmptySites: true,
    showFloat: true,
    cluster: true,
    clusterZoomLevel: 13,
    multiSelect: false
  };

  latestCallTime: Date;

  sites: SiteMarker[] = [];
  selectedSiteIds = new Set<number>();
  selectedStoreIds = new Set<number>();

  constructor(private authService: AuthService,
              private http: HttpClient,
              private rest: RestService) {
  }

  public getMarkersInBounds(bounds: { east, north, south, west }, gmap: google.maps.Map) {

    const callTime = new Date();
    this.latestCallTime = callTime;

    this.sites = [];

    // Remove previous from map, allow them to be garbage collected
    this.mapMarkers.forEach(marker => marker.setMap(null));
    this.mapMarkers = [];
    if (this.clusterer) {
      this.clusterer.clearMarkers();
    }

    this.clusterer = new MarkerClusterer(gmap, [],
      {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

    const finished = new Subject();

    // Run request(s)
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();
    params = params.set('size', '100');
    params = params.set('sort', 'longitude');
    _.forEach(bounds, (value, key) => params = params.set(key, value));
    this.runPage(url, params, 0, gmap, finished, callTime);

    return finished;
  }

  public refreshMarkers(gmap: google.maps.Map) {
    // Remove previous from map, allow them to be garbage collected
    this.mapMarkers.forEach(marker => marker.setMap(null));
    this.mapMarkers = [];
    if (this.clusterer) {
      this.clusterer.clearMarkers();
    }
    this.createMarkers(this.sites, gmap);
  }

  private createMarkers(sites: SiteMarker[], gmap: google.maps.Map) {
    // Create new markers for each result and reduce into one list
    const markers = sites.reduce((prev, curr) => prev.concat(this.createMarkerForSite(curr, gmap)), []);

    // Add Markers to complete list
    this.mapMarkers = this.mapMarkers.concat(markers);

    // Add the markers to the map or to the clusterer
    if (gmap.getZoom() > this.controls.clusterZoomLevel || !this.controls.cluster) {
      markers.forEach(marker => marker.setMap(gmap));
    } else {
      this.clusterer.addMarkers(markers);
    }
  }

  private runPage(url: string, params: HttpParams, pageNumber: number, gmap: google.maps.Map, finished: Subject<any>, callTime: Date) {
    params = params.set('page', pageNumber.toString());

    this.http.get<Pageable<SiteMarker>>(url, {headers: this.rest.getHeaders(), params: params})
      .subscribe((page: Pageable<SiteMarker>) => {

        this.sites = this.sites.concat(page.content);

        this.createMarkers(page.content, gmap);

        // If last page, or another request has started notify caller. Otherwise, continue retrieving pages.
        if (page.last || callTime !== this.latestCallTime) {
          finished.complete();
        } else {
          this.runPage(url, params, pageNumber + 1, gmap, finished, callTime);
        }
      });
  }

  private clearSelection() {
    // Get selected markers
    const selectedMarkers = this.mapMarkers.filter(marker => {
      const selection = marker['selection'];
      if (selection.storeId) {
        return this.selectedStoreIds.has(selection.storeId);
      } else {
        return this.selectedSiteIds.has(selection.siteId);
      }
    });

    // Clear selection ids
    this.selectedStoreIds.clear();
    this.selectedSiteIds.clear();

    // Refresh previously selected markers;
    selectedMarkers.forEach(marker => marker['refresh']());
  }

  private createMarkerForSite(site: SiteMarker, gmap: google.maps.Map): google.maps.Marker[] {
    const markers: google.maps.Marker[] = [];

    if (site.stores && site.stores.length > 0) {
      // Classify the types of stores
      const historical = site.stores.filter(store => store.storeType === 'HISTORICAL');
      const active = site.stores.filter(store => store.storeType === 'ACTIVE');
      const future = site.stores.filter(store => store.storeType === 'FUTURE');

      // ACTIVE - If there isn't an active store, and the user wants to see empty sites
      if (active.length === 0 && this.controls.showEmptySites) {
        // Only show the empty site marker if the site has not been back-filled with non-grocery
        if (!site.backfilledNonGrocery) {
          markers.push(this.getEmptySiteMarker(site, gmap));
        }
      } else if (this.controls.showActive) {
        active.forEach(store => {
          if (this.controls.showFloat || !store.floating) {
            markers.push(this.getStoreMarker(store, site, gmap));
          }
        })
      }

      // HISTORICAL
      if (this.controls.showHistorical) {
        if (historical.length > 1) {
          markers.push(this.getHistoricalCountMarker(historical.length, site))
        } else if (historical.length === 1) {
          if (this.controls.showFloat || !historical[0].floating) {
            markers.push(this.getStoreMarker(historical[0], site, gmap))
          }
        }
      }

      // FUTURE
      if (this.controls.showFuture) {
        if (future.length > 1) {
          // TODO Error state - no site should have multiple future stores - potentially create exclamation marker
        } else if (future.length === 1) {
          markers.push(this.getStoreMarker(future[0], site, gmap))
        }
      }
    } else {
      markers.push(this.getEmptySiteMarker(site, gmap));
    }
    return markers;
  }

  private getMarkerOptionsForSite(selected: boolean, site: SiteMarker, gmap: google.maps.Map) {
    return {
      position: {lat: site.latitude, lng: site.longitude},
      icon: {
        path: MarkerShape.DEFAULT,
        fillColor: this.getFillColor(selected, site.assigneeId),
        fillOpacity: 1,
        scale: 0.075,
        strokeColor: this.getStrokeColor(selected, gmap),
        strokeWeight: 2.5,
        anchor: new google.maps.Point(255, 510),
        labelOrigin: new google.maps.Point(255, 230),
      }
    }
  }

  private getActiveStoreMarkerOptions(selected: boolean, store: StoreMarker, site: SiteMarker, gmap: google.maps.Map) {
    return {
      position: {lat: site.latitude, lng: site.longitude},
      label: store.floating ? '' : {
        text: store.storeName[0],
        color: Color.WHITE,
        fontWeight: 'bold'
      },
      icon: {
        path: store.floating ? MarkerShape.LIFE_RING : MarkerShape.FILLED,
        fillColor: this.getFillColor(selected, site.assigneeId),
        fillOpacity: 1,
        scale: 0.075,
        strokeColor: this.getStrokeColor(selected, gmap),
        strokeWeight: store.floating ? 1.2 : 2.5,
        anchor: new google.maps.Point(255, 510),
        labelOrigin: new google.maps.Point(255, 230)
      }
    };
  }

  private getHistoricalStoreMarkerOptions(selected: boolean, store: StoreMarker, site: SiteMarker, gmap: google.maps.Map) {
    return {
      position: {lat: site.latitude, lng: site.longitude},
      label: store.floating ? '' : {
        text: store.storeName[0],
        color: Color.WHITE,
        fontWeight: 'bold'
      },
      icon: {
        path: store.floating ? MarkerShape.LIFE_RING : MarkerShape.FILLED,
        fillColor: this.getFillColor(selected, site.assigneeId),
        fillOpacity: 1,
        scale: 0.06,
        strokeColor: this.getStrokeColor(selected, gmap),
        strokeWeight: store.floating ? 1.2 : 2.5,
        anchor: new google.maps.Point(255, 510),
        labelOrigin: new google.maps.Point(255, 200),
        rotation: -90
      }
    };
  }

  private getFutureStoreMarkerOptions(selected: boolean, store: StoreMarker, site: SiteMarker, gmap: google.maps.Map) {
    return {
      position: {lat: site.latitude, lng: site.longitude},
      label: {
        text: store.storeName[0],
        color: Color.WHITE,
        fontWeight: 'bold'
      },
      icon: {
        path: MarkerShape.FILLED,
        fillColor: this.getFillColor(selected, site.assigneeId),
        fillOpacity: 1,
        scale: 0.06,
        strokeColor: this.getStrokeColor(selected, gmap),
        strokeWeight: 2.5,
        anchor: new google.maps.Point(255, 510),
        labelOrigin: new google.maps.Point(255, 230),
        rotation: 90
      }
    };
  }

  private addSelectionListener(marker: google.maps.Marker, selection: { storeId: number, siteId: number }) {
    marker.addListener('click', () => {
      // If not multi-selecting
      if (!this.controls.multiSelect) {
        // Clear any previous selection
        this.clearSelection();
      }

      // Add the storeId to the selection
      if (selection.storeId) {
        this.selectedStoreIds.add(selection.storeId);
      } else {
        this.selectedSiteIds.add(selection.siteId);
      }

      // Refresh the options for the marker
      marker['refresh']();

      this.clickListener$.next(selection);
    });
  }

  private getEmptySiteMarker(site: SiteMarker, gmap: google.maps.Map) {
    const marker = new google.maps.Marker(this.getMarkerOptionsForSite(this.selectedSiteIds.has(site.id), site, gmap));
    marker['refresh'] = () => marker.setOptions(this.getMarkerOptionsForSite(this.selectedSiteIds.has(site.id), site, gmap));
    marker['selection'] = {storeId: null, siteId: site.id};
    this.addSelectionListener(marker, marker['selection']);
    return marker;
  }


  private getStoreMarker(store: StoreMarker, site: SiteMarker, gmap: google.maps.Map) {
    const marker = new google.maps.Marker(this.getMarkerOptionsForStore(this.selectedStoreIds.has(store.id), store, site, gmap));
    marker['refresh'] = () => marker.setOptions(this.getMarkerOptionsForStore(this.selectedStoreIds.has(store.id), store, site, gmap));
    marker['selection'] = {storeId: store.id, siteId: site.id};
    this.addSelectionListener(marker, {storeId: store.id, siteId: site.id});
    return marker;
  }

  private getMarkerOptionsForStore(selected: boolean, store: StoreMarker, site: SiteMarker, gmap: google.maps.Map) {
    switch (store.storeType) {
      case 'ACTIVE':
        return this.getActiveStoreMarkerOptions(selected, store, site, gmap);
      case 'HISTORICAL':
        return this.getHistoricalStoreMarkerOptions(selected, store, site, gmap);
      default:
        return this.getFutureStoreMarkerOptions(selected, store, site, gmap);
    }
  }

  private getHistoricalCountMarker(count: number, site: SiteMarker) {
    const marker = new google.maps.Marker({
      position: {lat: site.latitude, lng: site.longitude},
      label: {
        text: count.toString(),
        color: Color.WHITE,
        fontWeight: 'bold'
      },
      icon: {
        path: MarkerShape.FILLED,
        fillColor: this.getFillColor(false, site.assigneeId),
        fillOpacity: 1,
        scale: 0.075,
        strokeColor: Color.RED,
        strokeWeight: 2.5,
        anchor: new google.maps.Point(255, 510),
        labelOrigin: new google.maps.Point(255, 200),
        rotation: -90
      }
    });
    marker['refresh'] = () => {};
    marker['selection'] = {storeId: null, siteId: site.id};

    return marker;
  }

  private getStrokeColor(selected: boolean, gmap: google.maps.Map) {
    if (gmap.getMapTypeId() === google.maps.MapTypeId.HYBRID) {
      return selected ? Color.YELLOW : Color.WHITE;
    } else {
      return selected ? Color.YELLOW : Color.WHITE
    }
  }

  private getFillColor(selected: boolean, assigneeId: number): string {
    if (assigneeId) {
      if (assigneeId === this.authService.sessionUser.id) {
        return selected ? Color.GREEN_DARK : Color.GREEN;
      } else {
        return selected ? Color.RED_DARK : Color.RED;
      }
    } else {
      return selected ? Color.BLUE_DARK : Color.BLUE;
    }
  }

}
