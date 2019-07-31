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
import { ProjectService } from './project.service';
import { SiteMarkerService } from '../site-marker.service';
import { StoreIconUtil } from '../../utils/StoreIconUtil';
import { MarkerType } from '../functionalEnums/MarkerType';
import { StoreStatusOptions } from '../functionalEnums/StoreStatusOptions';
import { StorageService } from './storage.service';
import { Control, ControlStorageKeys } from 'app/models/control';
import { DbEntityMarkerControls } from '../../models/db-entity-marker-controls';
import { EntitySelectionService } from './entity-selection.service';
import { SimplifiedBanner } from '../../models/simplified/simplified-banner';
import { CasingProjectService } from '../../casing/casing-project.service';
import { CloudinaryUtil } from '../../utils/cloudinary-util';

@Injectable()
export class DbEntityMarkerService {

  private ST_SITE_MARKERS = 'siteMarkers';
  private ACTIVE_CONTROLS_STORAGE_KEY = 'dbEntityMarkerServiceControls';
  private readonly SAVED_CONTROLS_STORAGE_KEY = ControlStorageKeys.savedDbEntityMarkerServiceControls;

  private readonly clickListener$ = new Subject<{ storeId: number, siteId: number, marker: google.maps.Marker }>();

  private _controls: DbEntityMarkerControls;

  private gmap: google.maps.Map;
  private clusterer: MarkerClusterer;

  private siteMarkerCache: { siteMarker: SiteMarker, markers: google.maps.Marker[] }[] = [];
  private selectedMarkers = new Set<google.maps.Marker>();

  private storeIdsCasedForProject = new Set<number>();

  private prevUpdate: Date;
  private prevBounds: { north: number, south: number, east: number, west: number };
  private prevSubscription;

  private visibleMarkers: google.maps.Marker[] = [];

  private selectionService: EntitySelectionService;
  private casingProjectService: CasingProjectService;

  gettingLocations = false;
  readonly visibleMarkersChanged$ = new Subject<void>();
  readonly markerTypeOptions = ['Pin', 'Logo', 'Validation', 'Cased for Project'];

  private readonly cloudinaryUtil: CloudinaryUtil;

  constructor(private authService: AuthService,
<<<<<<< HEAD
    private errorService: ErrorService,
    private fb: FormBuilder,
    private siteMarkerService: SiteMarkerService,
    private projectService: ProjectService,
    private casingDashboardService: CasingDashboardService,
    private storageService: StorageService) {

    this.initControls();
=======
              private errorService: ErrorService,
              private siteMarkerService: SiteMarkerService,
              private projectService: ProjectService,
              private storageService: StorageService) {
    this.cloudinaryUtil = new CloudinaryUtil();
>>>>>>> master
  }

  /**************************************
   * Public methods
   *************************************/

  /**
   * Initializes the map. Must be called before other public methods will work.
   */
  initMap(gmap: google.maps.Map,
          selectionService: EntitySelectionService,
          casingProjectService: CasingProjectService,
          storageKeyPrefix: string,
          controls?: DbEntityMarkerControls) {

    this.ST_SITE_MARKERS = storageKeyPrefix + '_' + this.ST_SITE_MARKERS;
    this.ACTIVE_CONTROLS_STORAGE_KEY = storageKeyPrefix + '_' + this.ACTIVE_CONTROLS_STORAGE_KEY;
    this.initControls();

    // CasingProject service
    this.casingProjectService = casingProjectService;

    // Selection
    this.selectionService = selectionService;
    this.selectionService.selectionUpdated$.subscribe(() => this.refreshMarkers());

    this.gmap = gmap;

    // Click Listener - self subscription
    this.clickListener$.subscribe((selection: { storeId: number, siteId: number, marker: google.maps.Marker }) => {
      this.selectionService.singleSelect(selection);
    });

    this.clusterer = new MarkerClusterer(this.gmap, [],
      { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });

    if (controls) {
      this._controls = controls;
    }

    if (!this._controls.updateOnBoundsChange) {
      this.storageService.getOne(this.ST_SITE_MARKERS).subscribe(siteMarkersJson => {
        if (siteMarkersJson) {
          JSON.parse(siteMarkersJson).forEach(sm => this.getMarkersForSite(new SiteMarker(sm)));
          this.showHideMarkersInBounds();
        }
      });
    }
  }

  destroy() {
    this.clickListener$.unsubscribe();
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

        if (!this._controls.updateOnBoundsChange) {
          this.storageService.set(this.ST_SITE_MARKERS, JSON.stringify(this.siteMarkerCache.map(sm => sm.siteMarker))).subscribe();
        }
      }))
    );

    if (this._controls.markerType === MarkerType.CASED_FOR_PROJECT) {
      const selectedProject = this.casingProjectService.getSelectedProject();
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
      if (this._controls.markerType === MarkerType.CASED_FOR_PROJECT) {
        const selectedProject = this.casingProjectService.getSelectedProject();
        if (selectedProject) {
          this.gettingLocations = true;
          this.projectService.getAllCasedStoreIds(selectedProject.id)
            .pipe(finalize(() => this.gettingLocations = false))
            .subscribe((storeIds: number[]) => {
              this.storeIdsCasedForProject.clear();
              storeIds.forEach(storeId => this.storeIdsCasedForProject.add(storeId));
              this.showHideMarkersInBounds();
            });
        }
      } else {
        this.showHideMarkersInBounds();
      }
    } else {
      this.getMarkersInMapView();
    }
  }

  getAllIncludedWithinRadius(latitude: number, longitude: number, radiusMeters: number) {
    this.verifyMapInitialized();

    this.gettingLocations = true;
    return this.siteMarkerService.getSiteMarkersInRadius(latitude, longitude, radiusMeters)
      .pipe(finalize(() => this.gettingLocations = false))
      .pipe(reduce((prev, curr) => prev.concat(curr)))
      .pipe(map((siteMarkers: SiteMarker[]) => this.getIncludedIds(siteMarkers)));
  }

  getAllIncludedWithinGeoJson(geoJson: string) {
    this.verifyMapInitialized();

    this.gettingLocations = true;
    return this.siteMarkerService.getSiteMarkersInGeoJson(geoJson)
      .pipe(finalize(() => this.gettingLocations = false))
      .pipe(reduce((prev, curr) => prev.concat(curr)))
      .pipe(map((siteMarkers: SiteMarker[]) => this.getIncludedIds(siteMarkers)));
  }

  getVisibleSiteMarkers() {
    return this.siteMarkerCache.map(s => {
      const sm = new SiteMarker(s.siteMarker);
      sm.stores = sm.stores.filter(st => this.shouldIncludeStoreMarker(st, sm));
      return sm;
    }).filter(s => (s.vacant && this._controls.showVacantSites) || s.stores.length > 0);
  }

  saveControlsAs(name: string) {
    this.storageService.getOne(ControlStorageKeys.savedDbEntityMarkerServiceControls).subscribe(savedControls => {
      if (!savedControls) {
        savedControls = {};
      }
      savedControls[name] = new Control(name, new Date(), this._controls);
      this.storageService.set(this.SAVED_CONTROLS_STORAGE_KEY, savedControls).subscribe();
    });
  }

  resetControls() {
    this._controls = new DbEntityMarkerControls();
    this.onControlsUpdated();
  }

  private onControlsUpdated() {
    this.storageService.set(this.ACTIVE_CONTROLS_STORAGE_KEY, this._controls).subscribe();

    // If user turns off auto refresh = re-pull the locations in view in order to preserve them
    if (!this._controls.updateOnBoundsChange) {
      this.storageService.set(this.ST_SITE_MARKERS, JSON.stringify(this.siteMarkerCache.map(sm => sm.siteMarker))).subscribe();
    }

    this.refreshMarkers();
  }

  private shouldIncludeStoreMarker(storeMarker: StoreMarker, siteMarker?: SiteMarker) {

    if (!storeMarker) {
      return false;
    }

    // TYPES FILTERS
    if ((!this._controls.showActive && (storeMarker.storeType === 'ACTIVE')) ||
      (!this._controls.showHistorical && (storeMarker.storeType === 'HISTORICAL')) ||
      (!this._controls.showFuture && (storeMarker.storeType === 'FUTURE')) ||
      (!this._controls.showFloat && (storeMarker.float))) {
      return false;
    }

    // Store List FILTER
    if (this._controls.storeList && this._controls.storeList.storeIds && !this._controls.storeList.storeIds.includes(storeMarker.id)) {
      return false;
    }

    // STATUS FILTER
    if ((!this._controls.showClosed && storeMarker.status === StoreStatusOptions.CLOSED) ||
      (!this._controls.showDeadDeal && storeMarker.status === StoreStatusOptions.DEAD_DEAL) ||
      (!this._controls.showNewUnderConstruction && storeMarker.status === StoreStatusOptions.NEW_UNDER_CONSTRUCTION) ||
      (!this._controls.showOpen && storeMarker.status === StoreStatusOptions.OPEN) ||
      (!this._controls.showPlanned && storeMarker.status === StoreStatusOptions.PLANNED) ||
      (!this._controls.showProposed && storeMarker.status === StoreStatusOptions.PROPOSED) ||
      (!this._controls.showRemodel && storeMarker.status === StoreStatusOptions.REMODEL) ||
      (!this._controls.showRumored && storeMarker.status === StoreStatusOptions.RUMORED) ||
      (!this._controls.showStrongRumor && storeMarker.status === StoreStatusOptions.STRONG_RUMOR) ||
      (!this._controls.showTemporarilyClosed && storeMarker.status === StoreStatusOptions.TEMPORARILY_CLOSED)) {
      return false;
    }

    // BANNER FILTER
    if (this._controls.banners && this._controls.banners.length && !this._controls.banners.find(b => b.id === storeMarker.bannerId)) {
      return false;
    }

    // ASSIGNMENT FILTER
    return !(this._controls.assignment && siteMarker.assigneeId !== this._controls.assignment.id);
  }

  private shouldIncludeSiteMarker(siteMarker: SiteMarker) {

    if (this._controls.assignment && (siteMarker && siteMarker.assigneeId !== this._controls.assignment.id)) {
      return false;
    }

    if (siteMarker.backfilledNonGrocery) {
      return this._controls.showSitesBackfilledByNonGrocery;
    }

    const siteIsVacant = siteMarker.stores.filter(st => st.storeType === 'ACTIVE').length === 0;
    // If site is vacant, don't include if filtering by banner or store list, or if showVacantSites isn't checked
    return !(siteIsVacant && (this._controls.banners && this._controls.banners.length > 0 || this._controls.storeList || !this._controls.showVacantSites));
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

  /**
   * Gets site and store ids for those that are not filtered out by the controls
   * @param siteMarkers
   */
  private getIncludedIds(siteMarkers: SiteMarker[]) {
    const siteIds = [];
    const storeIds = [];

    siteMarkers.forEach(siteMarker => {
      if (siteMarker.stores) {
        siteMarker.stores.filter(st => this.shouldIncludeStoreMarker(st)).forEach(st => storeIds.push(st.id));
      }
      if (this.shouldIncludeSiteMarker(siteMarker)) {
        siteIds.push(siteMarker.id);
      }
    });

    return { siteIds: siteIds, storeIds: storeIds };
  }

  private initControls() {
    // Immediately set default controls
    this._controls = new DbEntityMarkerControls();
    // If any saved controls were found, replace default controls;
    this.storageService.getOne(this.ACTIVE_CONTROLS_STORAGE_KEY).subscribe(storedControls => {
      if (storedControls) {
        this._controls = new DbEntityMarkerControls(storedControls);
      }
    });
  }

  private refreshMarkerOptions(marker: google.maps.Marker) {
    const store = marker['store'];
    const site = marker['site'];
    let selected = false;
    if (store) {
      selected = this.selectionService.storeIds.has(store.id);
      marker.setOptions(this.getMarkerOptionsForStore(store, site, selected));
    } else if (site) {
      selected = this.selectionService.siteIds.has(site.id);
      marker.setOptions(this.getMarkerOptionsForSite(site, selected));
    }
    if (selected) {
      this.selectedMarkers.add(marker);
    }
  }

  private showHideMarkersInBounds() {
    // Collect google markers
    const markers = this.siteMarkerCache.map(s => s.markers);

    // If google marker has a StoreMarker check for store inclusion, if no store, check for site inclusion
    const filteredGMarkers = markers.reduce((prev, curr) => prev.concat(curr), [])
      .filter(marker => {
        if (marker['store']) {
          return this.shouldIncludeStoreMarker(marker['store'], marker['site']);
        } else if (marker['site']) {
          return this.shouldIncludeSiteMarker(marker['site']);
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
    this.visibleMarkersChanged$.next();
  }

  private showMarkers(markers: google.maps.Marker[]) {
    // Show the now visible markers
    if (this._controls.cluster && this.gmap.getZoom() <= this._controls.clusterZoomLevel) {
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
    this.siteMarkerCache.push({ markers: markers, siteMarker: site });
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

      // ACTIVE - If there isn't an active store, and the user wants to see vacant sites
      if (active.length === 0) {
        markers.push(this.createSiteMarker(site));
      } else {
        active.forEach(store => markers.push(this.createStoreMarker(store, site)));
      }

      // HISTORICAL
      if (historical.length > 1) {
        // Show only latest historical on map
        const mostRecentHistorical = historical.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime())[0];
        markers.push(this.createStoreMarker(mostRecentHistorical, site));
      } else if (historical.length === 1) {
        markers.push(this.createStoreMarker(historical[0], site));
      }

      // FUTURE
      if (future.length > 1) {
        // TODO Error state - no site should have multiple future stores - potentially create exclamation marker
      } else if (future.length === 1) {
        markers.push(this.createStoreMarker(future[0], site));
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
    marker.addListener('click', () => this.clickListener$.next({ storeId: null, siteId: site.id, marker: marker }));

    if (this.selectionService.siteIds.has(site.id)) {
      this.selectedMarkers.add(marker);
    }
    return marker;
  }

  private createStoreMarker(store: StoreMarker, site: SiteMarker) {
    // Must make marker with coordinates for MarkerWithLabel to work
    const marker = new MarkerWithLabel({ position: { lat: site.latitude, lng: site.longitude } });
    marker['store'] = store;
    marker['site'] = site;
    marker.addListener('click', () => this.clickListener$.next({ storeId: store.id, siteId: site.id, marker: marker }));

    if (this.selectionService.storeIds.has(store.id)) {
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
      position: { lat: site.latitude, lng: site.longitude },
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
    };
  }

  private getMarkerOptionsForStore(store: StoreMarker, site: SiteMarker, selected: boolean) {
    const markerType = this._controls.markerType;
    const showLogo = markerType === MarkerType.LOGO && store.logoFileName != null;
    const showCased = markerType === MarkerType.CASED_FOR_PROJECT && this.storeIdsCasedForProject.has(store.id);
    const showValidated = markerType === MarkerType.VALIDATION && store.validatedDate != null;
    const showFullLabel = this.gmap.getZoom() >= this._controls.fullLabelMinZoomLevel;
    const assignedToUser = site.assigneeId === this.authService.sessionUser.id;
    const assignedToOther = !assignedToUser && site.assigneeId != null;

    return {
      position: { lat: site.latitude, lng: site.longitude },
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
      labelContent: StoreIconUtil.getStoreLabelContent(store, showLogo, showFullLabel, this.cloudinaryUtil),
      labelAnchor: StoreIconUtil.getStoreLabelAnchor(store, showLogo, showCased, showFullLabel),
      labelClass: StoreIconUtil.getStoreLabelClass(store, selected, showLogo, showCased, showFullLabel),
      labelInBackground: false
    };
  }

  addBannerFilter(banner: SimplifiedBanner) {
    this._controls.addBanner(banner);
    this.onControlsUpdated();
  }

  removeBannerFilter(banner: SimplifiedBanner) {
    this._controls.removeBanner(banner);
    this.onControlsUpdated();
  }

  get controls() {
    return new Proxy(this._controls, {
      set: (obj, prop, value) => {
        obj[prop] = value;
        this.onControlsUpdated();
        return true;
      }
    });
  }

  setControls(controls: DbEntityMarkerControls) {
    this._controls = controls;
    this.onControlsUpdated();
  }

}
