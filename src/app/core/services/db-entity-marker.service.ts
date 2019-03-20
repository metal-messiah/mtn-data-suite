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
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProjectService } from './project.service';
import { CasingDashboardService } from '../../casing/casing-dashboard/casing-dashboard.service';
import { SiteMarkerService } from '../site-marker.service';
import { StoreIconUtil } from '../../utils/StoreIconUtil';
import { MarkerType } from '../functionalEnums/MarkerType';

@Injectable()
export class DbEntityMarkerService {

  public readonly markerTypeOptions = ['Pin', 'Logo', 'Validation', 'Cased for Project'];

  private readonly clickListener$ = new Subject<{ storeId: number, siteId: number, marker: google.maps.Marker }>();

  public gettingLocations = false;
  public multiSelect = false;
  public deselecting = false;
  public controls: FormGroup;

  private gmap: google.maps.Map;
  private clusterer: MarkerClusterer;

  private siteMarkerCache: { siteMarker: SiteMarker, markers: google.maps.Marker[] }[] = [];
  private selectedMarkers = new Set<google.maps.Marker>();

  private storeIdsCasedForProject = new Set<number>();
  private selectedSiteIds = new Set<number>();
  private selectedStoreIds = new Set<number>();

  private prevUpdate: Date;
  private prevBounds: { north: number, south: number, east: number, west: number };
  private prevSubscription;

  private visibleMarkers = [];

  constructor(private authService: AuthService,
              private errorService: ErrorService,
              private fb: FormBuilder,
              private siteMarkerService: SiteMarkerService,
              private projectService: ProjectService,
              private casingDashboardService: CasingDashboardService) {
    this.initControls();

    this.clickListener$.subscribe((selection: { storeId: number, siteId: number, marker: google.maps.Marker }) => {
      // If not in multi-select mode, deselect previously selected markers
      if (!this.multiSelect) {
        this.selectedSiteIds.clear();
        this.selectedStoreIds.clear();
        this.selectedMarkers.forEach(marker => this.refreshMarkerOptions(marker));
        this.selectedMarkers.clear();
      }

      // Add to selected Ids
      if (selection.storeId) {
        if (this.deselecting) {
          this.selectedStoreIds.delete(selection.storeId);
        } else {
          this.selectedStoreIds.add(selection.storeId);
        }
      } else {
        if (this.deselecting) {
          this.selectedSiteIds.delete(selection.siteId);
        } else {
          this.selectedSiteIds.add(selection.siteId);
        }
      }

      // Refresh marker's options
      this.refreshMarkerOptions(selection.marker);
    });
  }

  /**************************************
   * Public methods
   *************************************/

  /**
   * Initializes the map. Must be called before other public methods will work.
   */
  public initMap(gmap: google.maps.Map, clickListener) {
    this.gmap = gmap;
    this.clickListener$.subscribe(clickListener);

    this.clusterer = new MarkerClusterer(this.gmap, [],
      {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

    if (!this.controls.get('updateOnBoundsChange').value) {
      const siteMarkersJson = localStorage.getItem('siteMarkers');
      if (siteMarkersJson) {
        JSON.parse(siteMarkersJson).forEach(sm => this.getMarkersForSite(new SiteMarker(sm)));
        this.showHideMarkersInBounds();
      }
    }
  }

  public onDestroy() {
    this.clickListener$.unsubscribe();
  }

  /**
   * Retrieves Marker data from web service and handles the showing and hiding markers according to controls
   */
  public getMarkersInMapView() {
    this.verifyMapInitialized();

    // Cancel previous web service request
    if (this.prevSubscription && !this.prevSubscription.closed) {
      this.prevSubscription.unsubscribe();
    }

    const bounds = {
      north: this.gmap.getBounds().getNorthEast().lat(),
      east: this.gmap.getBounds().getNorthEast().lng(),
      south: this.gmap.getBounds().getSouthWest().lat(),
      west: this.gmap.getBounds().getSouthWest().lng()
    };

    const requests = [];

    requests.push(this.siteMarkerService.getSiteMarkersForView(bounds, this.prevBounds, this.prevUpdate)
      .pipe(map((siteMarkers: SiteMarker[]) => {
        this.prevUpdate = new Date();
        this.prevBounds = bounds;
        this.removeOutOfBoundsMarkers(bounds);
        siteMarkers.forEach(sm => this.getMarkersForSite(sm));

        if (!this.controls.get('updateOnBoundsChange').value) {
          localStorage.setItem('siteMarkers', JSON.stringify(siteMarkers))
        }
      }))
    );

    if (this.controls.get('markerType').value === MarkerType.CASED_FOR_PROJECT) {
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
    this.prevSubscription = forkJoin(requests).pipe(finalize(() => this.gettingLocations = false))
      .subscribe(() => this.showHideMarkersInBounds(),
        (e) => this.errorService.handleServerError('Failed to retrieve map locations!', e, () => console.error(e)));
  }

  private removeOutOfBoundsMarkers(bounds: { north: number, south: number, east: number, west: number }) {
    const outOfBoundsSiteIds = new Set<number>();
    this.siteMarkerCache.forEach(s => {
      if (s.siteMarker.latitude > bounds.north || s.siteMarker.latitude < bounds.south ||
        s.siteMarker.longitude > bounds.east || s.siteMarker.longitude < bounds.west) {
        outOfBoundsSiteIds.add(s.siteMarker.id);
        s.markers.forEach(marker => this.removeMarker(marker));
      }
    });

    this.siteMarkerCache = this.siteMarkerCache.filter(s => !outOfBoundsSiteIds.has(s.siteMarker.id))
  }

  /**
   * Updates the marker symbology without getting new data from web service. Most useful for updating based on controls
   */
  public refreshMarkers() {
    this.verifyMapInitialized();

    // If no call has been made yet, get rather than refresh
    if (this.prevUpdate) {
      if (this.controls.get('markerType').value === MarkerType.CASED_FOR_PROJECT) {
        const selectedProject = this.casingDashboardService.getSelectedProject();
        if (selectedProject) {
          this.gettingLocations = true;
          this.projectService.getAllCasedStoreIds(selectedProject.id)
            .pipe(finalize(() => this.gettingLocations = false))
            .subscribe((storeIds: number[]) => {
              this.storeIdsCasedForProject.clear();
              storeIds.forEach(storeId => this.storeIdsCasedForProject.add(storeId));
              this.showHideMarkersInBounds()
            });
        }
      } else {
        this.showHideMarkersInBounds();
      }
    } else {
      this.getMarkersInMapView();
    }
  }

  public clearSelection() {
    this.verifyMapInitialized();

    this.selectedSiteIds.clear();
    this.selectedStoreIds.clear();
    this.refreshMarkers();
  }

  public selectInRadius(latitude: number, longitude: number, radiusMeters: number) {
    this.verifyMapInitialized();

    this.gettingLocations = true;
    this.siteMarkerService.getSiteMarkersInRadius(latitude, longitude, radiusMeters)
      .pipe(finalize(() => this.gettingLocations = false))
      .pipe(reduce((prev, curr) => prev.concat(curr)))
      .subscribe((siteMarkers: SiteMarker[]) => this.selectByIds(this.getSelectionIds(siteMarkers)));
  }

  public selectInGeoJson(geoJson: string) {
    this.verifyMapInitialized();

    this.gettingLocations = true;
    this.siteMarkerService.getSiteMarkersInGeoJson(geoJson)
      .pipe(finalize(() => this.gettingLocations = false))
      .pipe(reduce((prev, curr) => prev.concat(curr)))
      .subscribe((siteMarkers: SiteMarker[]) => this.selectByIds(this.getSelectionIds(siteMarkers)));
  }

  public getSelectedStoreIds() {
    return Array.from(this.selectedStoreIds);
  }

  /**************************************
   * Private methods
   *************************************/

  private verifyMapInitialized() {
    if (!this.gmap) {
      throw new Error('Must set gmap before using this method');
    }
  }

  private selectByIds(ids: { siteIds: number[], storeIds: number[] }) {
    if (this.deselecting) {
      ids.siteIds.forEach(id => this.selectedSiteIds.delete(id));
      ids.storeIds.forEach(id => this.selectedStoreIds.delete(id));
    } else {
      ids.siteIds.forEach(id => this.selectedSiteIds.add(id));
      ids.storeIds.forEach(id => this.selectedStoreIds.add(id));
    }
    this.refreshMarkers();
  }

  private getSelectionIds(siteMarkers: SiteMarker[]) {
    const siteIds = [];
    const storeIds = [];

    siteMarkers.forEach(siteMarker => {
      if (siteMarker.stores && siteMarker.stores.length > 0) {
        siteMarker.stores.forEach(storeMarker => {
          // If not updating with bound changes, only select visible markers
          if (this.includeStore(storeMarker) && (this.controls.get('updateOnBoundsChange').value ||
            this.visibleMarkers.findIndex(vm => vm.store && vm.store.id === storeMarker.id) !== -1)) {
            storeIds.push(storeMarker.id);
          }
        })
      }

      if (this.includeSite(siteMarker) && (this.controls.get('updateOnBoundsChange').value ||
        this.visibleMarkers.findIndex(vm => vm.site && vm.site.id === siteMarker.id) !== -1)) {
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
        markerType: 'Pin',
        updateOnBoundsChange: true
      });
    }

    this.controls.valueChanges.subscribe(val => localStorage.setItem('dbEntityMarkerServiceControls', JSON.stringify(val)));
  }

  private refreshMarkerOptions(marker: google.maps.Marker) {
    const store = marker['store'];
    const site = marker['site'];
    let selected = false;
    if (store) {
      selected = this.selectedStoreIds.has(store.id);
      marker.setOptions(this.getMarkerOptionsForStore(store, site, selected));
    } else if (site) {
      selected = this.selectedSiteIds.has(site.id);
      marker.setOptions(this.getMarkerOptionsForSite(site, selected));
    }
    if (selected) {
      this.selectedMarkers.add(marker);
    }
    // Do nothing for non-store non-site markers (like historical count marker)
  }

  private showHideMarkersInBounds() {
    const markers = this.siteMarkerCache.map(s => s.markers);
    const filteredMarkers = markers
      .reduce((prev, curr) => prev.concat(curr), [])
      .filter(marker =>
        marker['store'] ? this.includeStore(marker['store']) : (marker['site'] ? this.includeSite(marker['site']) : true)
      );

    filteredMarkers.forEach(marker => this.refreshMarkerOptions(marker));

    // If visible marker is not in filteredMarkers, remove from map.
    this.visibleMarkers.filter(marker => !filteredMarkers.includes(marker))
      .forEach(marker => this.removeMarker(marker));

    // Reset visible markers
    this.visibleMarkers = filteredMarkers;

    this.showMarkers(this.visibleMarkers);
  }

  private showMarkers(markers: google.maps.Marker[]) {
    // Show the now visible markers
    if (this.controls.get('cluster').value && this.gmap.getZoom() <= this.controls.get('clusterZoomLevel').value) {
      this.clusterer.addMarkers(markers);
    } else {
      this.clusterer.clearMarkers();
      markers.forEach(marker => marker.setMap(this.gmap));
    }
  }

  private removeMarker(marker: google.maps.Marker) {
    marker.setMap(null);
    this.clusterer.removeMarker(marker);
    this.selectedMarkers.delete(marker);
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
    return !(!this.controls.get('showFloat').value && storeMarker.float);
  }

  private includeSite(siteMarker: SiteMarker) {
    if (siteMarker.backfilledNonGrocery) {
      return this.controls.get('showSitesBackfilledByNonGrocery').value;
    }
    const siteIsEmpty = siteMarker.stores.filter(st => st.storeType === 'ACTIVE').length === 0;
    return !(!this.controls.get('showEmptySites').value && siteIsEmpty);
  }

  // Gets markers from cache if they exist or creates them
  private getMarkersForSite(site: SiteMarker): google.maps.Marker[] {
    // Check if cached markers exist
    const cached = this.siteMarkerCache.find(obj => obj.siteMarker.id === site.id);
    if (cached) {
      // If cached markers exist, check if they need to be updated
      if (site.updatedDate > cached.siteMarker.updatedDate) {
        // If updated required, ensure markers are removed from map
        cached.markers.forEach(marker => this.removeMarker(marker));

        // and replace cached markers with new ones
        cached.siteMarker = site;
        cached.markers = this.createMarkersForSite(site);
      }
      return cached.markers;
    }
    const markers = this.createMarkersForSite(site);
    this.siteMarkerCache.push({markers: markers, siteMarker: site});
    return markers;
  }

  private createMarkersForSite(site: SiteMarker): google.maps.Marker[] {
    const markers: google.maps.Marker[] = [];

    if (site.duplicate) {
      markers.push(this.createSiteMarker(site));
    } else if (site.stores && site.stores.length > 0) {
      // Classify the types of stores
      const historical = site.stores.filter(store => store.storeType === 'HISTORICAL');
      const active = site.stores.filter(store => store.storeType === 'ACTIVE');
      const future = site.stores.filter(store => store.storeType === 'FUTURE');

      // ACTIVE - If there isn't an active store, and the user wants to see empty sites
      if (active.length === 0) {
        markers.push(this.createSiteMarker(site));
      } else {
        active.forEach(store => markers.push(this.createStoreMarker(store, site)))
      }

      // HISTORICAL
      if (historical.length > 1) {
        // Show only latest historical on map
        const mostRecentHistorical = historical.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime())[0];
        markers.push(this.createStoreMarker(mostRecentHistorical, site));
      } else if (historical.length === 1) {
        markers.push(this.createStoreMarker(historical[0], site))
      }

      // FUTURE
      if (future.length > 1) {
        // TODO Error state - no site should have multiple future stores - potentially create exclamation marker
      } else if (future.length === 1) {
        markers.push(this.createStoreMarker(future[0], site))
      }
    } else {
      markers.push(this.createSiteMarker(site));
    }

    return markers;
  }

  /*****************************************
   * Create Markers
   *****************************************/

  private createSiteMarker(site: SiteMarker) {
    const marker = new google.maps.Marker();
    marker['site'] = site;
    marker.addListener('click', () => this.clickListener$.next({storeId: null, siteId: site.id, marker: marker}));

    if (this.selectedSiteIds.has(site.id)) {
      this.selectedMarkers.add(marker);
    }
    return marker;
  }

  private createStoreMarker(store: StoreMarker, site: SiteMarker) {
    // Must make marker with coordinates for MarkerWithLabel to work
    const marker = new MarkerWithLabel({position: {lat: site.latitude, lng: site.longitude}});
    marker['store'] = store;
    marker['site'] = site;
    marker.addListener('click', () => this.clickListener$.next({storeId: store.id, siteId: site.id, marker: marker}));

    if (this.selectedStoreIds.has(store.id)) {
      this.selectedMarkers.add(marker);
    }
    return marker;
  }

  /*****************************************
   * Get Marker Options
   *****************************************/

  private getMarkerOptionsForSite(site: SiteMarker, selected: boolean) {
    const assignedToUser = site.assigneeId === this.authService.sessionUser.id;
    const assignedToOther = !assignedToUser && site.assigneeId != null;

    return {
      position: {lat: site.latitude, lng: site.longitude},
      icon: {
        path: site.duplicate ? MarkerShape.FLAGGED : MarkerShape.DEFAULT,
        fillColor: StoreIconUtil.getFillColor(selected, assignedToUser, assignedToOther),
        fillOpacity: 1,
        scale: 0.075,
        strokeColor: selected ? Color.YELLOW : Color.WHITE,
        strokeWeight: 2.5,
        anchor: site.duplicate ? new google.maps.Point(80, 510) : new google.maps.Point(255, 510),
        labelOrigin: site.duplicate ? new google.maps.Point(255, 220) : new google.maps.Point(255, 230),
      }
    }
  }

  private getMarkerOptionsForStore(store: StoreMarker, site: SiteMarker, selected: boolean) {
    const markerType = this.controls.get('markerType').value;
    const showLogo = markerType === MarkerType.LOGO && store.logoFileName != null;
    const showCased = markerType === MarkerType.CASED_FOR_PROJECT && this.storeIdsCasedForProject.has(store.id);
    const showFullLabel = this.gmap.getZoom() >= this.controls.get('fullLabelMinZoomLevel').value;
    const showValidated = markerType === MarkerType.VALIDATION && store.validatedDate != null;
    const assignedToUser = site.assigneeId === this.authService.sessionUser.id;
    const assignedToOther = !assignedToUser && site.assigneeId != null;

    return {
      position: {lat: site.latitude, lng: site.longitude},
      icon: {
        path: StoreIconUtil.getStoreIconMarkerShape(store, showLogo, showCased, showValidated),
        fillColor: StoreIconUtil.getStoreIconFillColor(store, selected, assignedToUser, assignedToOther, showValidated),
        fillOpacity: 1,
        scale: StoreIconUtil.getStoreIconScale(store, showLogo, showCased),
        strokeColor: selected ? Color.YELLOW : Color.WHITE,
        strokeWeight: StoreIconUtil.getStoreIconStrokeWeight(store, showLogo, showCased),
        anchor: StoreIconUtil.getStoreIconAnchorPoint(store, showLogo, showCased),
        rotation: StoreIconUtil.getStoreIconRotation(store, showLogo, showCased)
      },
      labelContent: StoreIconUtil.getStoreLabelContent(store, showLogo, showFullLabel),
      labelAnchor: StoreIconUtil.getStoreLabelAnchor(store, showLogo, showCased, showFullLabel),
      labelClass: StoreIconUtil.getStoreLabelClass(store, selected, showLogo, showCased, showFullLabel),
      labelInBackground: false
    };
  }

}
