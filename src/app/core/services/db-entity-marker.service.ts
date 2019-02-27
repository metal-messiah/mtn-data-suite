import { Injectable } from '@angular/core';
import { SiteMarker } from '../../models/site-marker';
import { MarkerShape } from '../functionalEnums/MarkerShape';
import { Color } from '../functionalEnums/Color';
import { AuthService } from './auth.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as _ from 'lodash';
import { RestService } from './rest.service';
import * as MarkerClusterer from '@google/markerclusterer';
import * as MarkerWithLabel from '@google/markerwithlabel';
import { StoreMarker } from '../../models/store-marker';
import { of, Subject } from 'rxjs';
import { Pageable } from '../../models/pageable';
import { ErrorService } from './error.service';
import { finalize } from 'rxjs/operators';
import { DateUtil } from '../../utils/date-util';

@Injectable()
export class DbEntityMarkerService {

  // For Validation
  private readonly gradient = [
    '#ffc511', '#ffb30f', '#ffa313', '#fb921a', '#f68221', '#ef7228',
    '#e6622f', '#dc5435', '#d1463c', '#c53742', '#b72948', '#aa1c4f',
    '#990b56', '#87005d', '#710066', '#59006f', '#3c0078', '#000080'
  ];

  public clickListener$ = new Subject<{ storeId: number, siteId: number, marker: google.maps.Marker, gmap: google.maps.Map }>();
  public gettingLocations = false;
  public controls = {
    showActive: true,
    showHistorical: true,
    showFuture: true,
    showEmptySites: true,
    showSitesBackfilledByNonGrocery: false,
    showFloat: false,
    cluster: false,
    clusterZoomLevel: 13,
    multiSelect: false,
    multiDeselect: false,
    minPullZoomLevel: 10,
    fullLabelMinZoomLevel: 16,
    markerType: 'Pin'
  };

  public readonly markerTypeOptions = ['Pin', 'Logo', 'Validation', 'Project Completion'];

  private siteMarkerCache: { siteMarker: SiteMarker, markers: google.maps.Marker[] }[] = [];

  private readonly endpoint = '/api/map-marker';

  private clusterer: MarkerClusterer;

  private latestCallTime: Date;

  private selectedSiteIds = new Set<number>();
  private selectedStoreIds = new Set<number>();

  private visibleMarkers = [];
  private markersInBounds = [];
  private selectedMarkers = [];

  constructor(private authService: AuthService,
              private http: HttpClient,
              private errorService: ErrorService,
              private rest: RestService) {
    this.clickListener$.subscribe((selection: { storeId: number, siteId: number, marker: google.maps.Marker, gmap: google.maps.Map }) => {
      // If not in multi-select mode, deselect previously selected markers
      if (!this.controls.multiSelect) {
        this.selectedSiteIds.clear();
        this.selectedStoreIds.clear();
        this.selectedMarkers.forEach(marker => this.refreshMarkerOptions(marker, selection.gmap));
        this.selectedMarkers.length = 0;
      }

      // Add to selected Ids
      if (selection.storeId) {
        this.selectedStoreIds.add(selection.storeId);
      } else {
        this.selectedSiteIds.add(selection.siteId);
      }

      // Refresh marker's options
      this.refreshMarkerOptions(selection.marker, selection.marker.getMap());

      // Add it to selectedMarkers
      this.selectedMarkers.push(selection.marker);
    });
  }

  /**************************************
   * Public methods
   *************************************/

  /**
   * Retrieves Marker data from web service and handles the showing and hiding markers according to controls
   * @param gmap - The map to which the markers are added
   */
  public getMarkersInMapView(gmap: google.maps.Map) {
    const bounds = {
      north: gmap.getBounds().getNorthEast().lat(),
      east: gmap.getBounds().getNorthEast().lng(),
      south: gmap.getBounds().getSouthWest().lat(),
      west: gmap.getBounds().getSouthWest().lng()
    };
    const finished$ = new Subject();

    this.latestCallTime = new Date();

    if (!this.clusterer || this.clusterer.getMap() !== gmap) {
      this.clusterer = new MarkerClusterer(gmap, [],
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
    }

    // Set up request(s)
    const url = this.rest.getHost() + this.endpoint;
    let params = new HttpParams();
    params = params.set('size', '300');
    params = params.set('sort', 'longitude');
    _.forEach(bounds, (value, key) => params = params.set(key, String(value)));

    // Run Requests
    this.gettingLocations = true;
    this.runPage(url, params, 0, gmap, finished$, this.latestCallTime, []);
    finished$.pipe(finalize(() => this.gettingLocations = false))
      .subscribe((markersInBounds: google.maps.Marker[]) => {
          this.markersInBounds = markersInBounds;
          this.showHideMarkersInBounds(markersInBounds, gmap);
        },
        () => console.log('Cancelled'));
  }

  /**
   * Updates the marker symbology without getting new data from web service. Most useful for updating based on controls
   * @param gmap
   */
  public refreshMarkers(gmap: google.maps.Map) {
    if (this.latestCallTime) {
      this.gettingLocations = true;
      of(this.showHideMarkersInBounds(this.markersInBounds, gmap))
        .pipe(finalize(() => this.gettingLocations = false))
        .subscribe();
    } else {
      this.getMarkersInMapView(gmap);
    }
  }

  public clearSelection(gmap: google.maps.Map) {
    this.selectedSiteIds.clear();
    this.selectedStoreIds.clear();
    this.refreshMarkers(gmap);
  }

  public getSelectedStoreIds() {
    return Array.from(this.selectedStoreIds);
  }

  public multiSelect(ids: { siteIds: number[], storeIds: number[] }, gmap: google.maps.Map) {
    if (this.controls.multiDeselect) {
      ids.siteIds.forEach(id => this.selectedSiteIds.delete(id));
      ids.storeIds.forEach(id => this.selectedStoreIds.delete(id));
    } else {
      this.selectedSiteIds.clear();
      this.selectedStoreIds.clear();
      ids.siteIds.forEach(id => this.selectedSiteIds.add(id));
      ids.storeIds.forEach(id => this.selectedStoreIds.add(id));
    }
    this.refreshMarkers(gmap);
  }

  /**************************************
   * Private methods
   *************************************/

  private refreshMarkerOptions(marker: google.maps.Marker, gmap) {
    const store = marker['store'];
    const site = marker['site'];
    if (store) {
      marker.setOptions(this.getMarkerOptionsForStore(store, site, gmap));
    } else if (site) {
      marker.setOptions(this.getMarkerOptionsForSite(site, gmap));
    }
    // Do nothing for non-store non-site markers (like historical count marker)
  }

  private showHideMarkersInBounds(markersInBounds: google.maps.Marker[], gmap: google.maps.Map) {
    const currentlyVisibleMarkers = markersInBounds.filter(marker => {
      if (!this.controls.showHistorical && marker['historicalCountMarker']) {
        return false;
      }

      const store: StoreMarker = marker['store'];
      if (store) {
        if (!this.controls.showActive && (store && store.storeType === 'ACTIVE')) {
          return false;
        }
        if (!this.controls.showHistorical && (store && store.storeType === 'HISTORICAL')) {
          return false;
        }
        if (!this.controls.showFuture && (store && store.storeType === 'FUTURE')) {
          return false;
        }
        if (!this.controls.showFloat && store.float) {
          return false;
        }
        return true;
      }

      const site: SiteMarker = marker['site'];
      if (site) {
        if (site.backfilledNonGrocery) {
          return this.controls.showSitesBackfilledByNonGrocery;
        }
        const siteIsEmpty = site.stores.filter(st => st.storeType === 'ACTIVE').length === 0;
        return !(!this.controls.showEmptySites && siteIsEmpty);
      }

      return true;
    });
    currentlyVisibleMarkers.forEach(marker => this.refreshMarkerOptions(marker, gmap));

    // If visible marker is not in currentVisibleMarker, remove from map.
    this.visibleMarkers.filter(marker => !currentlyVisibleMarkers.includes(marker))
      .forEach(marker => {
        marker.setMap(null);
        this.clusterer.removeMarker(marker);
      });

    // Show the now visible markers
    if (this.controls.cluster && gmap.getZoom() <= this.controls.clusterZoomLevel) {
      this.clusterer.addMarkers(currentlyVisibleMarkers);
    } else {
      this.clusterer.clearMarkers();
      currentlyVisibleMarkers.forEach(marker => marker.setMap(gmap));
    }

    // Reset visible markers
    this.visibleMarkers = currentlyVisibleMarkers;
  }

  private getMarkersForPage(sites: SiteMarker[], gmap: google.maps.Map): google.maps.Marker[] {
    // Create new markers for each result and reduce into one list
    return sites.reduce((prev, curr) => prev.concat(this.getMarkersForSite(curr, gmap)), []);
  }

  private runPage(url: string, params: HttpParams, pageNumber: number, gmap: google.maps.Map,
                  finished$: Subject<any>, callTime: Date, markersInBounds: google.maps.Marker[]) {
    // Set param to get next page
    params = params.set('page', pageNumber.toString());

    // Get the data for the next page
    this.http.get<Pageable<SiteMarker>>(url, {headers: this.rest.getHeaders(), params: params})
      .subscribe((page: Pageable<SiteMarker>) => {
        const siteMarkers = page.content.map(sm => new SiteMarker(sm));
        // Add markers for page to markers in Bounds
        markersInBounds = markersInBounds.concat(this.getMarkersForPage(siteMarkers, gmap));
        // If last page, or another request has started, finish and notify caller.
        if (page.last || callTime !== this.latestCallTime) {
          finished$.next(markersInBounds);
          finished$.complete();
        } else {
          // Otherwise, continue retrieving pages.
          this.runPage(url, params, pageNumber + 1, gmap, finished$, callTime, markersInBounds);
        }
      }, err => {
        this.errorService.handleServerError('Failed to get db locations!', err,
          () => finished$.error(err),
          () => this.runPage(url, params, pageNumber, gmap, finished$, callTime, markersInBounds)
        )
      });
  }

  private getMarkersForSite(site: SiteMarker, gmap: google.maps.Map): google.maps.Marker[] {
    // Check if cached markers exist
    const cached = this.siteMarkerCache.find(obj => obj.siteMarker.id === site.id);
    if (cached) {
      // If cached markers exist, check if they need to be updated
      if (site.updatedDate > cached.siteMarker.updatedDate) {
        // If updated required, ensure markers are removed from map
        cached.markers.forEach(marker => {
          marker.setMap(null);
          this.clusterer.removeMarker(marker);
        });
        // and replace cached markers with new ones
        cached.siteMarker = site;
        cached.markers = this.createMarkersForSite(site, gmap);
      }
      return cached.markers;
    }
    const markers = this.createMarkersForSite(site, gmap);
    this.siteMarkerCache.push({markers: markers, siteMarker: site});
    return markers;
  }

  private createMarkersForSite(site: SiteMarker, gmap: google.maps.Map): google.maps.Marker[] {
    const markers: google.maps.Marker[] = [];

    if (site.duplicate) {
      markers.push(this.createSiteMarker(site, gmap));
    } else if (site.stores && site.stores.length > 0) {
      // Classify the types of stores
      const historical = site.stores.filter(store => store.storeType === 'HISTORICAL');
      const active = site.stores.filter(store => store.storeType === 'ACTIVE');
      const future = site.stores.filter(store => store.storeType === 'FUTURE');

      // ACTIVE - If there isn't an active store, and the user wants to see empty sites
      if (active.length === 0) {
        markers.push(this.createSiteMarker(site, gmap));
      } else {
        active.forEach(store => markers.push(this.createStoreMarker(store, site, gmap)))
      }

      // HISTORICAL
      if (historical.length > 1) {
        // Show only latest historical on map
        const mostRecentHistorical = historical.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime())[0];
        // markers.push(this.createHistoricalCountMarker(historical.length, site))
        markers.push(this.createStoreMarker(mostRecentHistorical, site, gmap));
      } else if (historical.length === 1) {
        markers.push(this.createStoreMarker(historical[0], site, gmap))
      }

      // FUTURE
      if (future.length > 1) {
        // TODO Error state - no site should have multiple future stores - potentially create exclamation marker
      } else if (future.length === 1) {
        markers.push(this.createStoreMarker(future[0], site, gmap))
      }
    } else {
      markers.push(this.createSiteMarker(site, gmap));
    }

    return markers;
  }

  /*****************************************
   * Create Markers
   *****************************************/

  private createSiteMarker(site: SiteMarker, gmap: google.maps.Map) {
    const marker = new google.maps.Marker();
    marker['site'] = site;
    marker.addListener('click', () => this.clickListener$.next({storeId: null, siteId: site.id, marker: marker, gmap: gmap}));

    if (this.selectedSiteIds.has(site.id)) {
      this.selectedMarkers.push(marker);
    }
    return marker;
  }

  private createStoreMarker(store: StoreMarker, site: SiteMarker, gmap: google.maps.Map) {
    // Must make marker with coordinates for MarkerWithLabel to work
    const marker = new MarkerWithLabel({position: {lat: site.latitude, lng: site.longitude}});
    marker['store'] = store;
    marker['site'] = site;
    marker.addListener('click', () => this.clickListener$.next({storeId: store.id, siteId: site.id, marker: marker, gmap: gmap}));

    if (this.selectedStoreIds.has(store.id)) {
      this.selectedMarkers.push(marker);
    }
    return marker;
  }

  /*****************************************
   * Get Marker Options
   *****************************************/

  private getMarkerOptionsForSite(site: SiteMarker, gmap: google.maps.Map) {
    const selected = this.selectedSiteIds.has(site.id);
    return {
      position: {lat: site.latitude, lng: site.longitude},
      icon: {
        path: site.duplicate ? MarkerShape.FLAGGED : MarkerShape.DEFAULT,
        fillColor: this.getFillColor(selected, site.assigneeId),
        fillOpacity: 1,
        scale: 0.075,
        strokeColor: this.getStrokeColor(site, selected, gmap),
        strokeWeight: 2.5,
        anchor: site.duplicate ? new google.maps.Point(80, 510) : new google.maps.Point(255, 510),
        labelOrigin: site.duplicate ? new google.maps.Point(255, 220) : new google.maps.Point(255, 230),
      }
    }
  }

  private getMarkerOptionsForStore(store: StoreMarker, site: SiteMarker, gmap: google.maps.Map) {
    const selected = this.selectedStoreIds.has(store.id);
    const showingLogo = this.controls.markerType === 'Logo' && store.logoFileName != null;

    return {
      position: {lat: site.latitude, lng: site.longitude},
      icon: this.getStoreIcon(store, site, selected, gmap, showingLogo),
      labelContent: this.getStoreLabelContent(store, gmap, showingLogo),
      labelAnchor: this.getStoreLabelAnchor(store, gmap, showingLogo),
      labelClass: this.getStoreLabelClass(store, gmap, selected),
      labelInBackground: false
    };
  }

  /*****************************************
   * Utility Functions
   *****************************************/

  private getStoreIcon(store: StoreMarker, site: SiteMarker, selected: boolean, gmap: google.maps.Map, showingLogo: boolean) {

    return {
      path: this.getStoreIconMarkerShape(store, showingLogo),
      fillColor: this.getStoreIconFillColor(store, selected, site.assigneeId),
      fillOpacity: 1,
      scale: this.getStoreIconScale(store, showingLogo),
      strokeColor: this.getStrokeColor(site, selected, gmap),
      strokeWeight: this.getStoreIconStrokeWeight(store, showingLogo),
      anchor: this.getStoreIconAnchorPoint(store, showingLogo),
      rotation: this.getStoreIconRotation(store, showingLogo)
    }
  }

  private getStoreIconStrokeWeight(store: StoreMarker, showingLogo: boolean) {
    if (showingLogo) {
      return 2.0;
    }
    return store.float ? 1.2 : 2.5;
  }

  private getStoreIconScale(store: StoreMarker, showingLogo: boolean) {
    if (showingLogo) {
      return 0.1;
    }
    return store.float ? 0.06 : 0.075;
  }

  private getStoreIconMarkerShape(store: StoreMarker, showingLogo: boolean) {
    if (this.controls.markerType === 'Validation' && store.validatedDate) {
      return MarkerShape.CERTIFICATE
    }
    if (showingLogo) {
      return MarkerShape.CIRCLE;
    }
    return store.float ? MarkerShape.LIFE_RING : MarkerShape.FILLED;
  }

  private getStoreIconAnchorPoint(store: StoreMarker, showingLogo: boolean) {
    if (showingLogo) {
      switch (store.storeType) {
        case 'FUTURE':
          return new google.maps.Point(-10, 0);
        case 'HISTORICAL':
          return new google.maps.Point(100, 0);
        default:
          return new google.maps.Point(0, 0);
      }
    }
    return store.float ? new google.maps.Point(255, 580) : new google.maps.Point(255, 510);
  }

  private getStoreIconRotation(store: StoreMarker, showingLogo: boolean) {
    if (showingLogo) {
      return 0;
    }
    switch (store.storeType) {
      case 'FUTURE':
        return 90;
      case 'HISTORICAL':
        return -90;
      default:
        return 0;
    }
  }

  private getStoreIconFillColor(store: StoreMarker, selected: boolean, assigneeId: number) {
    if (this.controls.markerType === 'Validation' && store.validatedDate) {
      let age = DateUtil.monthsBetween(new Date(), store.validatedDate);
      if (age > this.gradient.length - 1) {
        age = this.gradient.length - 1;
      }
      return this.gradient[age];
    }

    return this.getFillColor(selected, assigneeId);
  }

  private getStoreLabelClass(store: StoreMarker, gmap: google.maps.Map, selected: boolean) {
    const fullLabel = gmap.getZoom() >= this.controls.fullLabelMinZoomLevel;
    const showingLogo = this.controls.markerType === 'Logo' && store.logoFileName;
    switch (store.storeType) {
      case 'HISTORICAL':
        if (showingLogo) {
          return selected ? 'db-marker-image-label-historical-selected' : 'db-marker-image-label-historical';
        }
        return fullLabel ? 'db-marker-full-label-historical' :  'db-marker-short-label';
      case 'FUTURE':
        if (showingLogo) {
          return selected ? 'db-marker-image-label-future-selected' : 'db-marker-image-label-future';
        }
        return fullLabel ?  'db-marker-full-label-future' : 'db-marker-short-label';
      default:
        if (showingLogo) {
          return selected ? 'db-marker-image-label-active-selected' : 'db-marker-image-label-active';
        }
        return fullLabel ?  'db-marker-full-label-active' : 'db-marker-short-label';
    }
  }

  private getStoreLabelContent(store: StoreMarker, gmap: google.maps.Map, showingLogo: boolean) {
    let labelText = '';
    if (showingLogo) {
      const pictureLabel = document.createElement('img');
      pictureLabel.src = `https://res.cloudinary.com/mtn-retail-advisors/image/upload/c_limit,h_20/${store.logoFileName}`;
      return pictureLabel
    }
    if (store.storeName && !store.float) {
      if (gmap.getZoom() >= this.controls.fullLabelMinZoomLevel) {
        labelText = store.storeName
      } else {
        labelText = store.storeName[0];
      }
    }
    return labelText;
  }

  private getStoreLabelAnchor(store: StoreMarker, gmap: google.maps.Map, showingLogo: boolean) {
    const fullLabel = gmap.getZoom() >= this.controls.fullLabelMinZoomLevel;
    switch (store.storeType) {
      case 'HISTORICAL':
        if (showingLogo) {
          return new google.maps.Point(40, -10);
        }
        return fullLabel ? new google.maps.Point(40, 10) :  new google.maps.Point(23, 8);
      case 'FUTURE':
        if (showingLogo) {
          return new google.maps.Point(-40, -10);
        }
        return fullLabel ?  new google.maps.Point(-40, 10) : new google.maps.Point(-25, 8);
      default:
        if (showingLogo) {
          return new google.maps.Point(-5, 30);
        }
        return fullLabel ?  new google.maps.Point(0, 60) : new google.maps.Point(0, 32);
    }
  }

  private getStrokeColor(site: SiteMarker, selected: boolean, gmap: google.maps.Map) {
    return selected ? Color.YELLOW : Color.WHITE;
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
