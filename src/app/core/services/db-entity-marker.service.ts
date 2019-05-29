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
import { FormBuilder } from '@angular/forms';
import { ProjectService } from './project.service';
import { CasingDashboardService } from '../../casing/casing-dashboard/casing-dashboard.service';
import { SiteMarkerService } from '../site-marker.service';
import { StoreIconUtil } from '../../utils/StoreIconUtil';
import { MarkerType } from '../functionalEnums/MarkerType';

import * as _ from 'lodash';
import { StoreStatusOptions } from '../functionalEnums/StoreStatusOptions';
import { StorageService } from './storage.service';
import { Control, ControlStorageKeys } from 'app/models/control';
import { DbEntityMarkerControls } from '../../models/db-entity-marker-controls';

@Injectable()
export class DbEntityMarkerService {

  gettingLocations = false;
  multiSelect = false;
  deselecting = false;
  controls: DbEntityMarkerControls;

  readonly visibleMarkersChanged$ = new Subject<SiteMarker[]>();
  readonly markerTypeOptions = ['Pin', 'Logo', 'Validation', 'Cased for Project'];
  readonly selectionSet$ = new Subject<{ selectedSiteIds: Set<number>, selectedStoreIds: Set<number>, scrollTo: number }>();

  readonly SAVED_CONTROLS_STORAGE_KEY = ControlStorageKeys.savedDbEntityMarkerServiceControls;
  readonly ACTIVE_CONTROLS_STORAGE_KEY = ControlStorageKeys.dbEntityMarkerServiceControls;

  private selectionSetPrev: { selectedSiteIds: Set<number>, selectedStoreIds: Set<number>, scrollTo: number };

  private readonly clickListener$ = new Subject<{ storeId: number, siteId: number, marker: google.maps.Marker }>();

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
              private casingDashboardService: CasingDashboardService,
              private storageService: StorageService) {

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
  initMap(gmap: google.maps.Map, clickListener) {
    this.gmap = gmap;
    this.clickListener$.subscribe(clickListener);

    this.clusterer = new MarkerClusterer(this.gmap, [],
      {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

    if (!this.controls.updateOnBoundsChange) {
      const siteMarkersJson = localStorage.getItem('siteMarkers');
      if (siteMarkersJson) {
        JSON.parse(siteMarkersJson).forEach(sm => this.getMarkersForSite(new SiteMarker(sm)));
        this.showHideMarkersInBounds();
      }
    }
  }

  /**
   * Retrieves Marker data from web service and handles the showing and hiding markers according to controls
   */
  getMarkersInMapView() {
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

        if (!this.controls.updateOnBoundsChange) {
          localStorage.setItem('siteMarkers', JSON.stringify(this.siteMarkerCache.map(sm => sm.siteMarker)));
        }
      }))
    );

    if (this.controls.markerType === MarkerType.CASED_FOR_PROJECT) {
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

  removeMarkerForSite(siteId: number) {
    const index = this.siteMarkerCache.findIndex(sm => sm.siteMarker.id === siteId);
    const cached = this.siteMarkerCache[index];
    cached.markers.forEach(marker => this.removeMarker(marker));
    this.siteMarkerCache.splice(index, 1);
  }

  /**
   * Updates the marker symbology without getting new data from web service. Most useful for updating based on controls
   */
  refreshMarkers() {
    this.verifyMapInitialized();

    // If no call has been made yet, get rather than refresh
    if (this.prevUpdate) {
      if (this.controls.markerType === MarkerType.CASED_FOR_PROJECT) {
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

  clearSelection() {
    this.verifyMapInitialized();

    this.selectedSiteIds.clear();
    this.selectedStoreIds.clear();
    this.refreshMarkers();
  }

  selectStores(storeIds: number[]) {
    this.selectByIds({siteIds: [], storeIds});
  }

  selectSites(siteIds: number[]) {
    this.selectByIds({siteIds, storeIds: []});
  }

  selectInRadius(latitude: number, longitude: number, radiusMeters: number) {
    this.verifyMapInitialized();

    this.gettingLocations = true;
    this.siteMarkerService.getSiteMarkersInRadius(latitude, longitude, radiusMeters)
      .pipe(finalize(() => this.gettingLocations = false))
      .pipe(reduce((prev, curr) => prev.concat(curr)))
      .subscribe((siteMarkers: SiteMarker[]) => this.selectByIds(this.getSelectionIds(siteMarkers)));
  }

  selectInGeoJson(geoJson: string) {
    this.verifyMapInitialized();

    this.gettingLocations = true;
    this.siteMarkerService.getSiteMarkersInGeoJson(geoJson)
      .pipe(finalize(() => this.gettingLocations = false))
      .pipe(reduce((prev, curr) => prev.concat(curr)))
      .subscribe((siteMarkers: SiteMarker[]) => this.selectByIds(this.getSelectionIds(siteMarkers)));
  }

  getSelectedStoreIds() {
    return Array.from(this.selectedStoreIds);
  }

  getVisibleSiteMarkers() {
    return this.siteMarkerCache.map(s => s.siteMarker);
  }

  getVisibleMarkers() {
    return this.visibleMarkers;
  }

  saveControlsAs(name: string) {
    this.storageService.getOne(ControlStorageKeys.savedDbEntityMarkerServiceControls).subscribe(savedControls => {
      if (!savedControls) {
        savedControls = {};
      }
      savedControls[name] = new Control(name, new Date(), this.controls);
      this.storageService.set(this.SAVED_CONTROLS_STORAGE_KEY, savedControls);
    });
  }

  resetControls() {
    this.controls = new DbEntityMarkerControls();
  }

  onControlsUpdated() {
    this.storageService.set(this.ACTIVE_CONTROLS_STORAGE_KEY, this.controls);

    // If user turns off auto refresh = re-pull the locations in view in order to preserve them
    if (!this.controls.updateOnBoundsChange) {
      localStorage.setItem('siteMarkers', JSON.stringify(this.siteMarkerCache.map(sm => sm.siteMarker)));
    }

    this.refreshMarkers();
  }

  broadcastSelections() {
    if (!this.selectionSetPrev) {
      this.selectionSetPrev = {
        selectedSiteIds: new Set(this.selectedSiteIds),
        selectedStoreIds: new Set(this.selectedStoreIds),
        scrollTo: this.getScrollTo()
      };
      this.selectionSet$.next(this.selectionSetPrev);
    } else {
      const prevSelectedSiteIds = this.selectionSetPrev.selectedSiteIds;
      const prevSelectedStoreIds = this.selectionSetPrev.selectedStoreIds;
      if (!_.isEqual(prevSelectedSiteIds, this.selectedSiteIds) || !_.isEqual(prevSelectedStoreIds, this.selectedStoreIds)) {
        this.selectionSetPrev = {
          selectedSiteIds: new Set(this.selectedSiteIds),
          selectedStoreIds: new Set(this.selectedStoreIds),
          scrollTo: this.getScrollTo()
        };
        this.selectionSet$.next(this.selectionSetPrev);
      }
    }
  }

  getScrollTo() {
    return Array.from(this.selectedStoreIds).pop() || null;
  }

  includeStore(storeMarker: StoreMarker, siteMarker?: SiteMarker) {

    if (!storeMarker) {
      return false;
    }

    // TYPES FILTERS
    if ((!this.controls.showActive && (storeMarker.storeType === 'ACTIVE')) ||
      (!this.controls.showHistorical && (storeMarker.storeType === 'HISTORICAL')) ||
      (!this.controls.showFuture && (storeMarker.storeType === 'FUTURE')) ||
      (!this.controls.showFloat && (storeMarker.float))) {
      return false;
    }

    // DATASET FILTER
    if (this.controls.storeList && this.controls.storeList.storeIds && !this.controls.storeList.storeIds.includes(storeMarker.id)) {
      return false;
    }

    // STATUS FILTER
    if ((!this.controls.showClosed && storeMarker.status === StoreStatusOptions.CLOSED) ||
      (!this.controls.showDeadDeal && storeMarker.status === StoreStatusOptions.DEAD_DEAL) ||
      (!this.controls.showNewUnderConstruction && storeMarker.status === StoreStatusOptions.NEW_UNDER_CONSTRUCTION) ||
      (!this.controls.showOpen && storeMarker.status === StoreStatusOptions.OPEN) ||
      (!this.controls.showPlanned && storeMarker.status === StoreStatusOptions.PLANNED) ||
      (!this.controls.showProposed && storeMarker.status === StoreStatusOptions.PROPOSED) ||
      (!this.controls.showRemodel && storeMarker.status === StoreStatusOptions.REMODEL) ||
      (!this.controls.showRumored && storeMarker.status === StoreStatusOptions.RUMORED) ||
      (!this.controls.showStrongRumor && storeMarker.status === StoreStatusOptions.STRONG_RUMOR) ||
      (!this.controls.showTemporarilyClosed && storeMarker.status === StoreStatusOptions.TEMPORARILY_CLOSED)) {
      return false;
    }

    // BANNER FILTER
    if (this.controls.banners.length && !this.controls.banners.find(b => b.id === storeMarker.bannerId)) {
      return false;
    }

    // ASSIGNMENT FILTER
    return !(this.controls.assignment && siteMarker.assigneeId !== this.controls.assignment.id);
  }

  includeSite(siteMarker: SiteMarker) {

    if (this.controls.assignment && (siteMarker && siteMarker.assigneeId !== this.controls.assignment.id)) {
      return false;
    }

    if (siteMarker.backfilledNonGrocery) {
      return this.controls.showSitesBackfilledByNonGrocery;
    }

    const siteIsEmpty = siteMarker.stores.filter(st => st.storeType === 'ACTIVE').length === 0;
    // If site is empty, don't include if filtering by banner or dataset, or if showEmptySites isn't checked
    return !(siteIsEmpty && (this.controls.banners.length > 0 || this.controls.storeList || !this.controls.showEmptySites));
  }

  /**************************************
   * Private methods
   *************************************/
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
          if (this.includeStore(storeMarker) && (this.controls.updateOnBoundsChange ||
            this.visibleMarkers.find(vm => vm.store && vm.store.id === storeMarker.id))) {
            storeIds.push(storeMarker.id);
          }
        })
      }

      if (this.includeSite(siteMarker) && (this.controls.updateOnBoundsChange ||
        this.visibleMarkers.findIndex(vm => vm.site && vm.site.id === siteMarker.id) !== -1)) {
        siteIds.push(siteMarker.id);
      }
    });

    return {siteIds: siteIds, storeIds: storeIds};
  }

  private initControls() {
    // Immediately set default controls
    this.controls = new DbEntityMarkerControls();
    // If any saved controls were found, replace default controls;
    this.storageService.getOne(this.ACTIVE_CONTROLS_STORAGE_KEY).subscribe(storedControls => {
      if (storedControls) {
        this.controls = new DbEntityMarkerControls(storedControls);
      }
    });

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
    this.broadcastSelections();
    // Do nothing for non-store non-site markers (like historical count marker)
  }

  private showHideMarkersInBounds() {
    // Collect google markers
    const markers = this.siteMarkerCache.map(s => s.markers);

    // If google marker has a StoreMarker check for store inclusion, if no store, check for site inclusion
    const filteredGMarkers = markers.reduce((prev, curr) => prev.concat(curr), [])
      .filter(marker => {
          if (marker['store']) {
            return this.includeStore(marker['store'], marker['site']);
          } else if (marker['site']) {
            return this.includeSite(marker['site']);
          }
          return true;
        }
      );

    filteredGMarkers.forEach(marker => this.refreshMarkerOptions(marker));

    // If previously visible marker is not in filteredMarkers, remove from map.
    this.visibleMarkers.filter(marker => !filteredGMarkers.includes(marker))
      .forEach(marker => this.removeMarker(marker));

    // Reset visible markers
    this.visibleMarkers = filteredGMarkers;

    this.showMarkers(this.visibleMarkers);
    this.visibleMarkersChanged$.next(this.getVisibleSiteMarkers());
  }

  private showMarkers(markers: google.maps.Marker[]) {
    // Show the now visible markers
    if (this.controls.cluster && this.gmap.getZoom() <= this.controls.clusterZoomLevel) {
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
    const markerType = this.controls.markerType;
    const showLogo = markerType === MarkerType.LOGO && store.logoFileName != null;
    const showCased = markerType === MarkerType.CASED_FOR_PROJECT && this.storeIdsCasedForProject.has(store.id);
    const showValidated = markerType === MarkerType.VALIDATION && store.validatedDate != null;
    const showFullLabel = this.gmap.getZoom() >= this.controls.fullLabelMinZoomLevel;
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
