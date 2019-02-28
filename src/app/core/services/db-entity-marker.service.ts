import { Injectable } from '@angular/core';
import { SiteMarker } from '../../models/site-marker';
import { MarkerShape } from '../functionalEnums/MarkerShape';
import { Color } from '../functionalEnums/Color';
import { AuthService } from './auth.service';
import * as MarkerClusterer from '@google/markerclusterer';
import * as MarkerWithLabel from '@google/markerwithlabel';
import { StoreMarker } from '../../models/store-marker';
import { forkJoin, Subject } from 'rxjs';
import { ErrorService } from './error.service';
import { finalize, map, reduce, tap } from 'rxjs/operators';
import { DateUtil } from '../../utils/date-util';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProjectService } from './project.service';
import { CasingDashboardService } from '../../casing/casing-dashboard/casing-dashboard.service';
import { SiteMarkerService } from '../site-marker.service';

@Injectable()
export class DbEntityMarkerService {

  public readonly markerTypeOptions = ['Pin', 'Logo', 'Validation', 'Cased for Project'];

  public clickListener$ = new Subject<{ storeId: number, siteId: number, marker: google.maps.Marker, gmap: google.maps.Map }>();
  public gettingLocations = false;
  public controls: FormGroup;

  public multiSelect = false;
  public selectionMode = 'select';

// For Validation
  private readonly gradient = [
    '#ffc511', '#ffb30f', '#ffa313', '#fb921a', '#f68221', '#ef7228',
    '#e6622f', '#dc5435', '#d1463c', '#c53742', '#b72948', '#aa1c4f',
    '#990b56', '#87005d', '#710066', '#59006f', '#3c0078', '#000080'
  ];

  private clusterer: MarkerClusterer;

  private prevHandbrake: { interrupt: boolean };

  private siteMarkerCache: { siteMarker: SiteMarker, markers: google.maps.Marker[] }[] = [];

  private storeIdsCasedForProject = new Set<number>();
  private selectedSiteIds = new Set<number>();
  private selectedStoreIds = new Set<number>();

  private visibleMarkers = [];
  private markersInBounds = [];
  private selectedMarkers = [];

  constructor(private authService: AuthService,
              private errorService: ErrorService,
              private fb: FormBuilder,
              private siteMarkerService: SiteMarkerService,
              private projectService: ProjectService,
              private casingDashboardService: CasingDashboardService) {
    this.initControls();

    this.clickListener$.subscribe((selection: { storeId: number, siteId: number, marker: google.maps.Marker, gmap: google.maps.Map }) => {
      // If not in multi-select mode, deselect previously selected markers
      if (!this.multiSelect) {
        this.selectedSiteIds.clear();
        this.selectedStoreIds.clear();
        this.selectedMarkers.forEach(marker => this.refreshMarkerOptions(marker, selection.gmap));
        this.selectedMarkers.length = 0;
      }

      // Add to selected Ids
      if (selection.storeId) {
        if (this.selectionMode === 'select') {
          this.selectedStoreIds.add(selection.storeId);
        } else {
          this.selectedStoreIds.delete(selection.storeId);
        }
      } else {
        if (this.selectionMode === 'select') {
          this.selectedSiteIds.add(selection.siteId);
        } else {
          this.selectedSiteIds.delete(selection.siteId);
        }
      }

      // Refresh marker's options
      this.refreshMarkerOptions(selection.marker, selection.marker.getMap());
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

    if (this.prevHandbrake) {
      this.prevHandbrake.interrupt = true;
    }

    if (!this.clusterer || this.clusterer.getMap() !== gmap) {
      this.clusterer = new MarkerClusterer(gmap, [],
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
    }

    const requests = [];

    this.prevHandbrake = {
      interrupt: false
    };

    requests.push(this.siteMarkerService.getSiteMarkersInBounds(bounds, this.prevHandbrake, 'longitude')
      .pipe(map((siteMarkers: SiteMarker[]) => this.getMarkersForPage(siteMarkers, gmap)))
      .pipe(reduce((prev, curr) => prev.concat(curr))));

    if (this.controls.get('markerType').value === 'Cased for Project') {
      const selectedProject = this.casingDashboardService.getSelectedProject();
      if (selectedProject) {
        requests.push(this.projectService.getAllCasedStoreIds(selectedProject.id)
          .pipe(tap((storeIds: number[]) => {
            this.storeIdsCasedForProject.clear();
            storeIds.forEach(storeId => this.storeIdsCasedForProject.add(storeId));
          })));
      }
    }

    this.gettingLocations = true;
    forkJoin(requests).pipe(finalize(() => this.gettingLocations = false))
      .subscribe(results => {
          this.markersInBounds = results[0] as google.maps.Marker[];
          this.showHideMarkersInBounds(this.markersInBounds, gmap);
        },
        () => console.log('Cancelled'));
  }

  /**
   * Updates the marker symbology without getting new data from web service. Most useful for updating based on controls
   * @param gmap
   */
  public refreshMarkers(gmap: google.maps.Map) {
    // If no call has been made yet, get rather than refresh
    if (this.prevHandbrake) {
      if (this.controls.get('markerType').value === 'Cased for Project') {
        const selectedProject = this.casingDashboardService.getSelectedProject();
        if (selectedProject) {
          this.gettingLocations = true;
          this.projectService.getAllCasedStoreIds(selectedProject.id)
            .pipe(finalize(() => this.gettingLocations = false))
            .subscribe((storeIds: number[]) => {
              this.storeIdsCasedForProject.clear();
              storeIds.forEach(storeId => this.storeIdsCasedForProject.add(storeId));
              this.showHideMarkersInBounds(this.markersInBounds, gmap)
            });
        }
      } else {
        this.showHideMarkersInBounds(this.markersInBounds, gmap);
      }
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

  public selectInRadius(latitude: number, longitude: number, radiusMeters: number, gmap: google.maps.Map) {
    if (this.prevHandbrake) {
      this.prevHandbrake.interrupt = true;
    }
    this.prevHandbrake = {interrupt: false};
    this.gettingLocations = true;
    this.siteMarkerService.getSiteMarkersInRadius(latitude, longitude, radiusMeters, this.prevHandbrake)
      .pipe(finalize(() => this.gettingLocations = false))
      .pipe(reduce((prev, curr) => prev.concat(curr)))
      .subscribe((siteMarkers: SiteMarker[]) => this.selectByIds(this.getSelectionIds(siteMarkers), gmap));
  }

  public selectInGeoJson(geoJson: string, gmap: google.maps.Map) {
    if (this.prevHandbrake) {
      this.prevHandbrake.interrupt = true;
    }
    this.prevHandbrake = {interrupt: false};
    this.gettingLocations = true;
    this.siteMarkerService.getSiteMarkersInGeoJson(geoJson, this.prevHandbrake)
      .pipe(finalize(() => this.gettingLocations = false))
      .pipe(reduce((prev, curr) => prev.concat(curr)))
      .subscribe((siteMarkers: SiteMarker[]) => this.selectByIds(this.getSelectionIds(siteMarkers), gmap));
  }

  /**************************************
   * Private methods
   *************************************/

  private selectByIds(ids: { siteIds: number[], storeIds: number[] }, gmap: google.maps.Map) {
    if (this.selectionMode === 'deselect') {
      ids.siteIds.forEach(id => this.selectedSiteIds.delete(id));
      ids.storeIds.forEach(id => this.selectedStoreIds.delete(id));
    } else {
      ids.siteIds.forEach(id => this.selectedSiteIds.add(id));
      ids.storeIds.forEach(id => this.selectedStoreIds.add(id));
    }
    this.refreshMarkers(gmap);
  }

  private getSelectionIds(siteMarkers: SiteMarker[]) {
    const siteIds = [];
    const storeIds = [];

    siteMarkers.forEach(siteMarker => {
      if (siteMarker.stores && siteMarker.stores.length > 0) {
        siteMarker.stores.forEach(storeMarker => {
          if (this.includeStore(storeMarker)) {
            storeIds.push(storeMarker.id);
          }
        })
      }
      if (this.includeSite(siteMarker)) {
        siteIds.push(siteMarker.id);
      }
    });

    return {siteIds: siteIds, storeIds: storeIds};
  }

  private initControls() {
    const storedControls = localStorage.getItem('dbEntityMarkerServiceControls');
    if (storedControls) {
      this.controls = this.fb.group(JSON.parse(storedControls));
    } else {
      this.controls = this.fb.group({
        showActive: true,
        showHistorical: true,
        showFuture: true,
        showEmptySites: true,
        showSitesBackfilledByNonGrocery: false,
        showFloat: false,
        cluster: false,
        clusterZoomLevel: 13,
        minPullZoomLevel: 10,
        fullLabelMinZoomLevel: 16,
        markerType: 'Pin'
      });
    }

    this.controls.valueChanges.subscribe(val => localStorage.setItem('dbEntityMarkerServiceControls', JSON.stringify(val)));
  }

  private refreshMarkerOptions(marker: google.maps.Marker, gmap) {
    const store = marker['store'];
    const site = marker['site'];
    let selected = false;
    if (store) {
      selected = this.selectedStoreIds.has(store.id);
      marker.setOptions(this.getMarkerOptionsForStore(store, site, gmap, selected));
    } else if (site) {
      selected = this.selectedSiteIds.has(site.id);
      marker.setOptions(this.getMarkerOptionsForSite(site, gmap, selected));
    }
    if (selected) {
      this.selectedMarkers.push(marker);
    }
    // Do nothing for non-store non-site markers (like historical count marker)
  }

  private showHideMarkersInBounds(markersInBounds: google.maps.Marker[], gmap: google.maps.Map) {
    const currentlyVisibleMarkers = markersInBounds.filter(marker => {

      const storeMarker: StoreMarker = marker['store'];
      if (storeMarker) {
        return this.includeStore(storeMarker);
      }

      const siteMarker: SiteMarker = marker['site'];
      if (siteMarker) {
        return this.includeSite(siteMarker);
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
    if (this.controls.get('cluster').value && gmap.getZoom() <= this.controls.get('clusterZoomLevel').value) {
      this.clusterer.addMarkers(currentlyVisibleMarkers);
    } else {
      this.clusterer.clearMarkers();
      currentlyVisibleMarkers.forEach(marker => marker.setMap(gmap));
    }

    // Reset visible markers
    this.visibleMarkers = currentlyVisibleMarkers;
  }

  private includeStore(storeMarker: StoreMarker) {
    if (!this.controls.get('showActive').value && (storeMarker && storeMarker.storeType === 'ACTIVE')) {
      return false;
    }
    if (!this.controls.get('showHistorical').value && (storeMarker && storeMarker.storeType === 'HISTORICAL')) {
      return false;
    }
    if (!this.controls.get('showFuture').value && (storeMarker && storeMarker.storeType === 'FUTURE')) {
      return false;
    }
    if (!this.controls.get('showFloat').value && storeMarker.float) {
      return false;
    }
    return true;
  }

  private includeSite(siteMarker: SiteMarker) {
    if (siteMarker.backfilledNonGrocery) {
      return this.controls.get('showSitesBackfilledByNonGrocery').value;
    }
    const siteIsEmpty = siteMarker.stores.filter(st => st.storeType === 'ACTIVE').length === 0;
    return !(!this.controls.get('showEmptySites').value && siteIsEmpty);
  }

  private getMarkersForPage(sites: SiteMarker[], gmap: google.maps.Map): google.maps.Marker[] {
    // Create new markers for each result and reduce into one list
    return sites.reduce((prev, curr) => prev.concat(this.getMarkersForSite(curr, gmap)), []);
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

  private getMarkerOptionsForSite(site: SiteMarker, gmap: google.maps.Map, selected: boolean) {
    return {
      position: {lat: site.latitude, lng: site.longitude},
      icon: {
        path: site.duplicate ? MarkerShape.FLAGGED : MarkerShape.DEFAULT,
        fillColor: this.getFillColor(selected, site.assigneeId),
        fillOpacity: 1,
        scale: 0.075,
        strokeColor: selected ? Color.YELLOW : Color.WHITE,
        strokeWeight: 2.5,
        anchor: site.duplicate ? new google.maps.Point(80, 510) : new google.maps.Point(255, 510),
        labelOrigin: site.duplicate ? new google.maps.Point(255, 220) : new google.maps.Point(255, 230),
      }
    }
  }

  private getMarkerOptionsForStore(store: StoreMarker, site: SiteMarker, gmap: google.maps.Map, selected: boolean) {
    const showLogo = this.controls.get('markerType').value === 'Logo' && store.logoFileName != null;
    const showCased = this.controls.get('markerType').value === 'Cased for Project' && this.storeIdsCasedForProject.has(store.id);


    return {
      position: {lat: site.latitude, lng: site.longitude},
      icon: this.getStoreIcon(store, site, selected, gmap, showLogo, showCased),
      labelContent: this.getStoreLabelContent(store, gmap, showLogo),
      labelAnchor: this.getStoreLabelAnchor(store, gmap, showLogo, showCased),
      labelClass: this.getStoreLabelClass(store, gmap, selected, showLogo, showCased),
      labelInBackground: false
    };
  }

  /*****************************************
   * Utility Functions
   *****************************************/

  private getStoreIcon(store: StoreMarker, site: SiteMarker, selected: boolean, gmap: google.maps.Map,
                       showLogo: boolean, showCased: boolean) {

    return {
      path: this.getStoreIconMarkerShape(store, showLogo, showCased),
      fillColor: this.getStoreIconFillColor(store, selected, site.assigneeId),
      fillOpacity: 1,
      scale: this.getStoreIconScale(store, showLogo, showCased),
      strokeColor: selected ? Color.YELLOW : Color.WHITE,
      strokeWeight: this.getStoreIconStrokeWeight(store, showLogo, showCased),
      anchor: this.getStoreIconAnchorPoint(store, showLogo, showCased),
      rotation: this.getStoreIconRotation(store, showLogo, showCased)
    }
  }

  private getStoreIconStrokeWeight(store: StoreMarker, showLogo: boolean, showCased: boolean) {
    if (showCased || showLogo) {
      return 2.0;
    }
    return store.float ? 1.2 : 2.5;
  }

  private getStoreIconScale(store: StoreMarker, showLogo: boolean, showCased: boolean) {
    if (showCased || showLogo) {
      return 0.1;
    }
    return store.float ? 0.06 : 0.075;
  }

  private getStoreIconMarkerShape(store: StoreMarker, showLogo: boolean, showCased: boolean) {
    if (this.controls.get('markerType').value === 'Validation' && store.validatedDate) {
      return MarkerShape.CERTIFICATE
    }
    if (showCased || showLogo) {
      return MarkerShape.CIRCLE;
    }
    return store.float ? MarkerShape.LIFE_RING : MarkerShape.FILLED;
  }

  private getStoreIconAnchorPoint(store: StoreMarker, showLogo: boolean, showCased: boolean) {
    if (showCased || showLogo) {
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

  private getStoreIconRotation(store: StoreMarker, showLogo: boolean, showCased: boolean) {
    if (showCased || showLogo) {
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
    if (this.controls.get('markerType').value === 'Validation' && store.validatedDate) {
      let age = DateUtil.monthsBetween(new Date(), store.validatedDate);
      if (age > this.gradient.length - 1) {
        age = this.gradient.length - 1;
      }
      return this.gradient[age];
    }

    return this.getFillColor(selected, assigneeId);
  }

  /**
   * Returns the appropriate css class for the store's label.
   * Limitation - can only associate one class
   * @param store
   * @param gmap
   * @param selected
   */
  private getStoreLabelClass(store: StoreMarker, gmap: google.maps.Map, selected: boolean, showLogo: boolean, showCased: boolean) {
    // Logos
    if (showCased || showLogo) {
      switch (store.storeType) {
        case 'HISTORICAL':
          return selected ? 'db-marker-image-label-historical-selected' : 'db-marker-image-label-historical';
        case 'FUTURE':
          return selected ? 'db-marker-image-label-future-selected' : 'db-marker-image-label-future';
        default:
          return selected ? 'db-marker-image-label-active-selected' : 'db-marker-image-label-active';
      }
    }

    // Normal
    const fullLabel = gmap.getZoom() >= this.controls.get('fullLabelMinZoomLevel').value;
    switch (store.storeType) {
      case 'HISTORICAL':
        return fullLabel ? 'db-marker-full-label-historical' : 'db-marker-short-label';
      case 'FUTURE':
        return fullLabel ? 'db-marker-full-label-future' : 'db-marker-short-label';
      default:
        return fullLabel ? 'db-marker-full-label-active' : 'db-marker-short-label';
    }
  }

  private getStoreLabelContent(store: StoreMarker, gmap: google.maps.Map, showLogo: boolean) {
    let labelText = '';
    if (showLogo) {
      const pictureLabel = document.createElement('img');
      pictureLabel.src = `https://res.cloudinary.com/mtn-retail-advisors/image/upload/c_limit,h_20/${store.logoFileName}`;
      return pictureLabel
    }
    if (store.storeName && !store.float) {
      if (gmap.getZoom() >= this.controls.get('fullLabelMinZoomLevel').value) {
        labelText = store.storeName
      } else {
        labelText = store.storeName[0];
      }
    }
    return labelText;
  }

  private getStoreLabelAnchor(store: StoreMarker, gmap: google.maps.Map, showLogo: boolean, showCased: boolean) {
    const fullLabel = gmap.getZoom() >= this.controls.get('fullLabelMinZoomLevel').value;

    if (showCased || showLogo) {
      switch (store.storeType) {
        case 'HISTORICAL':
          return new google.maps.Point(10, -10);
        case 'FUTURE':
          return new google.maps.Point(-10, -10);
        default:
          return new google.maps.Point(-5, showCased ? 20 : 30);
      }
    }

    switch (store.storeType) {
      case 'HISTORICAL':
        return fullLabel ? new google.maps.Point(40, 10) : new google.maps.Point(23, 8);
      case 'FUTURE':
        return fullLabel ? new google.maps.Point(-40, 10) : new google.maps.Point(-25, 8);
      default:
        return fullLabel ? new google.maps.Point(0, 60) : new google.maps.Point(0, 32);
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
