import { Injectable } from '@angular/core';
import { SiteMarker } from '../../models/site-marker';
import { MarkerShape } from '../functionalEnums/MarkerShape';
import { Color } from '../functionalEnums/Color';
import { AuthService } from './auth.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';
import { RestService } from './rest.service';
import { map } from 'rxjs/operators';
import * as MarkerClusterer from '@google/markerclusterer';
import { StoreMarker } from '../../models/store-marker';

@Injectable()
export class DbEntityMarkerService {

  private readonly endpoint = '/api/map-marker';
  private mapMarkers: google.maps.Marker[] = [];
  private clusterer: MarkerClusterer;

  filter = {
    showActive: true,
    showHistorical: true,
    showFuture: true,
    showEmptySites: true,
    showFloat: true,
    cluster: true
  };

  selectedSiteIds = new Set<number>();
  selectedStoreIds = new Set<number>();

  constructor(private authService: AuthService,
              private http: HttpClient,
              private rest: RestService) {
  }

  public getMarkersInBounds(bounds: { east, north, south, west }, gmap: google.maps.Map) {
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();
    _.forEach(bounds, (value, key) => params = params.set(key, value));
    return this.http.get<SiteMarker[]>(url, {headers: this.rest.getHeaders(), params: params})
      .pipe(map(list => this.createMapMarkers(list, gmap)));
  }

  private createMapMarkers(sites: SiteMarker[], gmap: google.maps.Map) {
    console.log('Zoom:' + gmap.getZoom());
    // Remove previous from map
    this.mapMarkers.forEach(marker => marker.setMap(null));
    if (this.clusterer) {
      this.clusterer.clearMarkers();
    }

    // Create new markers for each result
    this.mapMarkers = sites.reduce((prev, curr) => prev.concat(this.createMarkerForSite(curr, gmap)), []);
    if (gmap.getZoom() >= 13 || !this.filter.cluster) {
      this.mapMarkers.forEach(marker => marker.setMap(gmap));
    } else {
      this.clusterer = new MarkerClusterer(gmap, this.mapMarkers,
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
    }
  }

  private createMarkerForSite(site: SiteMarker, gmap: google.maps.Map): google.maps.Marker[] {
    const markers: google.maps.Marker[] = [];

    // If a site has no active store AND is not marked as back filled by non grocery, create a site pin (with a hole in it)
    if (site.stores && site.stores.length > 0) {
      const historical = site.stores.filter(store => store.storeType === 'HISTORICAL');
      const active = site.stores.filter(store => store.storeType === 'ACTIVE');
      const future = site.stores.filter(store => store.storeType === 'FUTURE');

      // ACTIVE
      if (active.length === 0 && this.filter.showEmptySites) {
        markers.push(this.getEmptySiteMarker(site, gmap));
      } else if (this.filter.showActive) {
        active.forEach(store => {
          if (this.filter.showFloat || !store.float) {
            markers.push(this.getActiveStoreMarker(store, site, gmap));
          }
        })
      }

      // HISTORICAL
      if (this.filter.showHistorical) {
        if (historical.length > 1) {
          markers.push(this.getHistoricalCountMarker(historical.length, site, gmap))
        } else if (historical.length === 1) {
          if (this.filter.showFloat || !historical[0].float) {
            markers.push(this.getHistoricalStoreMarker(historical[0], site, gmap))
          }
        }
      }

      // FUTURE
      if (this.filter.showFuture) {
        if (future.length > 1) {
          // TODO Error state - no site should have multiple future stores - potentially create exclamation marker
        } else if (future.length === 1) {
          markers.push(this.getFutureStoreMarker(future[0], site, gmap))
        }
      }
    } else {
      markers.push(this.getEmptySiteMarker(site, gmap));
    }
    return markers;
  }

  private getStrokeColor(selected: boolean, gmap: google.maps.Map) {
    if (gmap.getMapTypeId() === google.maps.MapTypeId.HYBRID) {
      return selected ? Color.YELLOW : Color.WHITE;
    } else {
      return selected ? Color.YELLOW : Color.BLACK
    }
  }

  private getEmptySiteMarker(site: SiteMarker, gmap: google.maps.Map) {
    const selected = this.selectedSiteIds.has(site.id);

    return new google.maps.Marker({
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
    });
  }

  private getActiveStoreMarker(store: StoreMarker, site: SiteMarker, gmap: google.maps.Map) {
    const selected = this.selectedStoreIds.has(store.id);

    return new google.maps.Marker({
      position: {lat: site.latitude, lng: site.longitude},
      label: store.float ? '' : {
        text: store.storeName[0],
        color: Color.WHITE,
        fontWeight: 'bold'
      },
      icon: {
        path: store.float ? MarkerShape.LIFE_RING : MarkerShape.FILLED,
        fillColor: this.getFillColor(selected, site.assigneeId),
        fillOpacity: 1,
        scale: 0.075,
        strokeColor: this.getStrokeColor(selected, gmap),
        strokeWeight: store.float ? 1.2 : 2.5,
        anchor: new google.maps.Point(255, 510),
        labelOrigin: new google.maps.Point(255, 230)
      }
    });
  }

  private getHistoricalStoreMarker(store: StoreMarker, site: SiteMarker, gmap: google.maps.Map) {
    const selected = this.selectedStoreIds.has(store.id);

    return new google.maps.Marker({
      position: {lat: site.latitude, lng: site.longitude},
      label: store.float ? '' : {
        text: store.storeName[0],
        color: Color.WHITE,
        fontWeight: 'bold'
      },
      icon: {
        path: store.float ? MarkerShape.LIFE_RING : MarkerShape.FILLED,
        fillColor: this.getFillColor(selected, site.assigneeId),
        fillOpacity: 1,
        scale: 0.06,
        strokeColor: this.getStrokeColor(selected, gmap),
        strokeWeight: store.float ? 1.2 : 2.5,
        anchor: new google.maps.Point(255, 510),
        labelOrigin: new google.maps.Point(255, 200),
        rotation: -90
      }
    });
  }

  private getFutureStoreMarker(store: StoreMarker, site: SiteMarker, gmap: google.maps.Map) {
    const selected = this.selectedStoreIds.has(store.id);

    return new google.maps.Marker({
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
    });
  }

  private getHistoricalCountMarker(count: number, site: SiteMarker, gmap: google.maps.Map) {
    return new google.maps.Marker({
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
