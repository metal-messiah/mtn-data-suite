import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';

import { of, Subject, Subscription } from 'rxjs';
import { debounce, debounceTime, delay, finalize } from 'rxjs/internal/operators';

import { AuthService } from '../../core/services/auth.service';
import { CasingDashboardService } from './casing-dashboard.service';
import { DbEntityMarkerService } from '../../core/services/db-entity-marker.service';
import { EntitySelectionService } from '../../core/services/entity-selection.service';
import { ErrorService } from '../../core/services/error.service';
import { GeocoderService } from '../../core/services/geocoder.service';
import { MapService } from '../../core/services/map.service';
import { NavigatorService } from '../../core/services/navigator.service';
import { ProjectBoundaryService } from '../services/project-boundary.service';
import { ProjectService } from '../../core/services/project.service';
import { SiteService } from '../../core/services/site.service';
import { StoreService } from '../../core/services/store.service';

import { DatabaseSearchComponent } from '../database-search/database-search.component';
import { DbLocationInfoCardComponent } from '../../shared/db-location-info-card/db-location-info-card.component';
import { DownloadDialogComponent } from '../download-dialog/download-dialog.component';
import { GoogleSearchComponent } from '../google-search/google-search.component';
import { GoogleInfoCardComponent } from '../../shared/google-info-card/google-info-card.component';
import { LatLngSearchComponent } from '../lat-lng-search/lat-lng-search.component';
import { SiteMergeDialogComponent } from '../site-merge-dialog/site-merge-dialog.component';
import { UserProfileSelectComponent } from '../../shared/user-profile-select/user-profile-select.component';

import { Coordinates } from '../../models/coordinates';
import { GooglePlace } from '../../models/google-place';
import { SimplifiedSite } from '../../models/simplified/simplified-site';
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { SimplifiedUserProfile } from '../../models/simplified/simplified-user-profile';
import { Site } from '../../models/full/site';
import { Store } from '../../models/full/store';

import { DraggableSiteLayer } from '../../models/draggable-site-layer';
import { FindMeLayer } from '../../models/find-me-layer';
import { FollowMeLayer } from '../../models/follow-me-layer';
import { GooglePlaceLayer } from '../../models/google-place-layer';

import { GeometryUtil } from '../../utils/geometry-util';

import { DbEntityInfoCardItem } from '../db-entity-info-card-item';
import { InfoCardItem } from '../info-card-item';
import { GoogleInfoCardItem } from '../google-info-card-item';
import { StorageService } from '../../core/services/storage.service';
import { SiteMarker } from '../../models/site-marker';
import { StoreMarker } from '../../models/store-marker';

import * as _ from 'lodash';
import { ListManagerService } from '../../shared/list-manager/list-manager.service';
import { SimplifiedStoreList } from '../../models/simplified/simplified-store-list';
import { StoreSidenavService } from '../../shared/store-sidenav/store-sidenav.service';

import { Pages as ListManagerPages } from '../../shared/list-manager/list-manager-pages';
import { Pages as StoreSidenavPages } from '../../shared/store-sidenav/store-sidenav-pages';
import {
  AddRemoveStoresListDialogComponent,
  AddRemoveType
} from 'app/shared/add-remove-stores-list-dialog/add-remove-stores-list-dialog.component';
import { StoreStatusOptions } from 'app/core/functionalEnums/StoreStatusOptions';
import { ConfirmDialogComponent } from 'app/shared/confirm-dialog/confirm-dialog.component';
import { SelectBannerComponent } from '../select-banner/select-banner.component';
import { BannerService } from 'app/core/services/banner.service';
import { SimplifiedBanner } from 'app/models/simplified/simplified-banner';
import { TextInputDialogComponent } from 'app/shared/text-input-dialog/text-input-dialog.component';
import { FileInputComponent } from 'app/shared/file-input/file-input.component';
import { ControlStorageKeys, Control } from 'app/models/control';
import { StoredControlsSelectionDialogComponent } from 'app/shared/stored-controls-selection-dialog/stored-controls-selection-dialog.component';

export enum CasingDashboardMode {
  DEFAULT, FOLLOWING, MOVING_MAPPABLE, CREATING_NEW, MULTI_SELECT, EDIT_PROJECT_BOUNDARY, DUPLICATE_SELECTION
}

@Component({
  selector: 'mds-casing-dashboard',
  templateUrl: './casing-dashboard.component.html',
  styleUrls: ['./casing-dashboard.component.css'],
  providers: []
})
export class CasingDashboardComponent implements OnInit, OnDestroy {

  // Layers
  draggableSiteLayer: DraggableSiteLayer;
  followMeLayer: FollowMeLayer;
  googlePlacesLayer: GooglePlaceLayer;

  // Flags
  filterSideNavIsOpen = false;
  updating = false;
  markCasedStores = false;
  savingBoundary = false;

  // sidenav
  showStoreLists: boolean;
  storeListsStorageKey = 'showStoreLists';

  // Modes
  selectedDashboardMode: CasingDashboardMode = CasingDashboardMode.DEFAULT;

  // Enums for template
  casingDashboardMode = CasingDashboardMode;

  googleSearchSubscription: Subscription;

  subscriptions: Subscription[] = [];

  // Duplicate Selection
  selectedSiteId: number;

  infoCard: InfoCardItem;
  initiateDuplicateSelection$ = new Subject<number>();
  initiateSiteMove$ = new Subject<Site>();
  siteUpdated$ = new Subject<number>();

  movingSite: Site;

  visibleStoresCount = 0;

  isMobile: boolean;
  isTooNarrow: boolean;

  highlightTab = false;


  storeListOptions: SimplifiedStoreList[] = [];

  constructor(public mapService: MapService,
    public dbEntityMarkerService: DbEntityMarkerService,
    public geocoderService: GeocoderService,
    public casingDashboardService: CasingDashboardService,
    private siteService: SiteService,
    private storeService: StoreService,
    private projectService: ProjectService,
    private bannerService: BannerService,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private navigatorService: NavigatorService,
    private dialog: MatDialog,
    private authService: AuthService,
    private errorService: ErrorService,
    public entitySelectionService: EntitySelectionService,
    public projectBoundaryService: ProjectBoundaryService,
    private storageService: StorageService,
    private listManagerService: ListManagerService,
    private storeSidenavService: StoreSidenavService) {
  }

  ngOnInit() {
    this.markCasedStores = (localStorage.getItem('markCasedStores') === 'true');

    this.storageService.getOne(this.storeListsStorageKey).subscribe((shouldShow) => {
      if (shouldShow === undefined) {
        this.storageService.set(this.storeListsStorageKey, false).subscribe((resp: boolean) => {
          this.showStoreLists = resp;
        })
      } else {
        this.showStoreLists = shouldShow;
      }
    });

    this.dbEntityMarkerService.visibleMarkersChanged$.subscribe((vm) => {
      this.visibleStoresCount = _.uniqBy(vm.map(m => new SiteMarker(m['site'])), 'id').length;
    });

    this.isMobile = this.checkMobile();
    this.isTooNarrow = this.checkTooNarrow();

    this.setStoreListOptions();

    this.listManagerService.listsAreDirty$.subscribe(() => {
      this.setStoreListOptions();
    });

  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => s.unsubscribe());
    // this.dbEntityMarkerService.onDestroy();
  }


  compareFn(o1: SimplifiedStoreList, o2: SimplifiedStoreList): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  checkMobile() {
    return (typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobile') !== -1);
  }

  checkTooNarrow() {
    const body: HTMLElement = document.querySelector('body');
    return body.offsetWidth < 740;
  }

  onMapReady() {
    this.dbEntityMarkerService.initMap(this.mapService.getMap(), selection => {
      if (this.selectedDashboardMode === CasingDashboardMode.DEFAULT) {
        if (this.casingDashboardService.getShouldOpenInfoCard()) {
          this.infoCard = new DbEntityInfoCardItem(DbLocationInfoCardComponent, selection,
            this.initiateDuplicateSelection$, this.initiateSiteMove$, this.siteUpdated$);
        }
      } else if (this.selectedDashboardMode === CasingDashboardMode.DUPLICATE_SELECTION) {
        this.onDuplicateSiteSelected(selection.siteId);
      }
    });

    console.log(`Map is ready`);


    this.subscriptions.push(this.casingDashboardService.programmaticSelectionChanged$.subscribe(
      (selection: { siteMarker: SiteMarker, storeMarker: StoreMarker }) => {
        this.isMobile = this.checkMobile();
        this.isTooNarrow = this.checkTooNarrow();

        if (this.isTooNarrow) {
          this.toggleStoreLists();
        }

        this.openInfoCardFromSidenav(selection.siteMarker, selection.storeMarker);
      }));

    this.subscriptions.push(this.initiateDuplicateSelection$.subscribe(siteId => {
      // Change the mode (should disables all other user interactions that might conflict)
      this.selectedDashboardMode = CasingDashboardMode.DUPLICATE_SELECTION;
      this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);

      // Save the first site's ID so you can use it later
      this.selectedSiteId = siteId;

      // Display instructions to user
      const ref = this.snackBar.open(`Select another site to merge with this one`, 'Cancel');

      // If user clicks cancel, close snackbar and return to default mode
      ref.onAction().subscribe(() => {
        this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
        this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);
      });
    }));

    this.subscriptions.push(this.initiateSiteMove$.subscribe((site: Site) => {
      this.movingSite = site;
      this.selectedDashboardMode = CasingDashboardMode.MOVING_MAPPABLE;
      this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);
      // Create new site layer
      this.draggableSiteLayer = new DraggableSiteLayer(this.mapService, { lat: site.latitude, lng: site.longitude });
    }));

    this.subscriptions.push(this.siteUpdated$.subscribe(() => this.getEntitiesInBounds()));

    this.subscriptions.push(this.mapService.boundsChanged$.pipe(this.getDebounce()).subscribe(() => {
      if (this.dbEntityMarkerService.controls.get('updateOnBoundsChange').value) {
        this.getEntitiesInBounds()
      }
    }));

    this.subscriptions.push(this.mapService.mapClick$.subscribe(() => this.infoCard = null));

    this.subscriptions.push(this.casingDashboardService.projectChanged$.subscribe(() => {
      this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
      this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);
      this.projectBoundaryService.hideProjectBoundaries();
      this.getEntitiesInBounds();
    }));

    this.route.queryParams.subscribe((params: Params) => {
      const storeId = parseInt(params['store-id'], 10);
      if (!isNaN(storeId)) {
        this.storeService.getOneById(storeId).subscribe((store: Store) => {
          this.mapService.setCenter(this.siteService.getCoordinates(store.site));
          this.mapService.setZoom(17);
        });
      }
    });

    // Check Project boundary service to see if boundary should be showing, if so, show it anew
    if (this.projectBoundaryService.isShowingBoundary()) {
      this.projectBoundaryService.showProjectBoundaries().subscribe();
    }
  }

  openInfoCardFromSidenav(siteMarker: SiteMarker, storeMarker: StoreMarker) {
    if (this.casingDashboardService.getShouldOpenInfoCard()) {
      this.dbEntityMarkerService.clearSelection();
      if (storeMarker.id) {
        this.dbEntityMarkerService.selectStores([storeMarker.id]);
      }
      if (siteMarker && siteMarker.id && storeMarker.isEmpty) {
        this.dbEntityMarkerService.selectSites([siteMarker.id]);
      }
      this.infoCard = new DbEntityInfoCardItem(DbLocationInfoCardComponent, {
        storeId: storeMarker.id,
        siteId: siteMarker ? siteMarker.id : null
      },
        this.initiateDuplicateSelection$, this.initiateSiteMove$, this.siteUpdated$);
    }
  }

  private getDebounce() {
    return debounce(() => of(true)
      .pipe(delay(this.followMeLayer != null ? 10000 : 1000)));
  }

  getEntitiesInBounds(): void {
    if (this.mapService.getZoom() >= this.dbEntityMarkerService.controls.get('minPullZoomLevel').value) {
      this.dbEntityMarkerService.getMarkersInMapView();
    } else {
      this.snackBar.open('Zoom in or change Pull zoom limit', null, { duration: 3000 })
    }
  }

  initSiteCreation(): void {
    this.selectedDashboardMode = CasingDashboardMode.CREATING_NEW;
    this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);
    // Create new Layer for new Location
    this.draggableSiteLayer = new DraggableSiteLayer(this.mapService, this.mapService.getCenter());
  }

  cancelSiteCreation(): void {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);
    // Remove layer from map
    this.draggableSiteLayer.removeFromMap();
    // Delete new Location layer
    this.draggableSiteLayer = null;
  }

  editNewLocation(): void {
    const coordinates = this.draggableSiteLayer.getCoordinatesOfDraggableMarker();
    this.ngZone.run(() => {
      const snackBarRef = this.snackBar.open('Reverse Geocoding...', null);
      this.geocoderService.reverseGeocode(coordinates)
        .pipe(finalize(() => snackBarRef.dismiss()))
        .subscribe((newSite: Site) => {
          // If reverse geocode is successful - exit creation state (moving on to site page)
          newSite.latitude = coordinates.lat;
          newSite.longitude = coordinates.lng;
          newSite.type = 'ANCHOR';
          this.createNewSite(new Site(newSite));
        }, (err) => {
          this.cancelSiteCreation();
          console.error(err);
        });
    });
  }

  private createNewSite(site: Site) {
    this.ngZone.run(() => {
      // Create a new site from reverse geocode - make sharable via service
      const snackBarRef2 = this.snackBar.open('Creating new site...', null);
      this.siteService.create(site)
        .pipe(finalize(() => this.cancelSiteCreation()))
        .subscribe(() => {
          this.snackBar.open('Successfully created new Site', null, { duration: 1500 });
          this.getEntitiesInBounds();
        }, err => {
          snackBarRef2.dismiss();
          this.cancelSiteCreation();
          this.errorService.handleServerError('Failed to create new Site!', err,
            () => {
            },
            () => this.createNewSite(site));
        });
    })
  }

  /*
Geo-location
 */
  findMe(): void {
    this.navigatorService.getCurrentPosition().subscribe(position => {
      this.mapService.setCenter(position);
      // Create layer
      const fm = new FindMeLayer(this.mapService, position);
      // After 5 seconds remove it from the map
      setTimeout(() => {
        fm.removeFromMap();
      }, 5000);
      // Garbage collect will destroy it...
    });
  }

  activateFollowMe(): void {
    this.selectedDashboardMode = CasingDashboardMode.FOLLOWING;
    this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);
    this.followMeLayer = new FollowMeLayer(this.mapService, this.mapService.getCenter());
    this.navigatorService.watchPosition({ maximumAge: 2000 }).subscribe(
      position => {
        this.followMeLayer.updatePosition(position);
        this.mapService.setCenter(position);
      },
      err => {
        let message = '';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = 'Permission denied';
            break;
          case err.POSITION_UNAVAILABLE:
            message = 'Position unavailable';
            break;
          case err.PERMISSION_DENIED_TIMEOUT:
            message = 'Position timeout';
            break;
        }
        console.log('Error: ' + message);
      }
    );
  }

  deactivateFollowMe(): void {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);

    this.navigatorService.cancelWatch();
    this.followMeLayer.removeFromMap();
    this.followMeLayer = null;
  }

  /****************************************
   *  Move Store
   ****************************************/

  /**
   * Called to reset the state if user cancels moving a store
   */
  cancelMove() {
    this.movingSite = null;
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);
    // Remove layer from map
    this.draggableSiteLayer.removeFromMap();
    // Delete new Location layer
    this.draggableSiteLayer = null;
  }

  /**
   * After user moves pin and clicks save, siteService is used to update the coordinates
   */
  saveMove() {
    const coordinates = this.draggableSiteLayer.getCoordinatesOfDraggableMarker();
    this.movingSite.latitude = coordinates.lat;
    this.movingSite.longitude = coordinates.lng;
    // Get new coordinates
    this.siteService.update(this.movingSite)
      .pipe(finalize(() => {
        this.movingSite = null;
        this.draggableSiteLayer.removeFromMap()
      }))
      .subscribe(() => {
        this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
        this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);
        this.snackBar.open('Successfully created new Site', null, { duration: 1500 });
        this.getEntitiesInBounds();
      }, err => this.errorService.handleServerError('Failed to update new Site location!', err,
        () => console.log('Cancel'),
        () => this.saveMove()));
  }

  /*
Multi-select
 */
  enableMultiSelect(): void {
    this.selectedDashboardMode = CasingDashboardMode.MULTI_SELECT;
    this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);
    this.dbEntityMarkerService.clearSelection();
    this.dbEntityMarkerService.multiSelect = true;
    // Activate Map Drawing Tools and listen for completed Shapes
    this.mapService.activateDrawingTools().subscribe(shape => {
      const geoJson = GeometryUtil.getGeoJsonFromShape(shape);
      if (geoJson.geometry.type === 'Point') {
        const longitude = geoJson.geometry.coordinates[0];
        const latitude = geoJson.geometry.coordinates[1];
        const radiusMeters = geoJson.properties.radius;
        this.dbEntityMarkerService.selectInRadius(latitude, longitude, radiusMeters);
      } else {
        this.dbEntityMarkerService.selectInGeoJson(JSON.stringify(geoJson));
      }
      this.mapService.clearDrawings();
    });
  }

  cancelMultiSelect(): void {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);
    this.dbEntityMarkerService.clearSelection();
    this.dbEntityMarkerService.multiSelect = false;
    this.dbEntityMarkerService.deselecting = false;
    this.mapService.deactivateDrawingTools();
  }

  openDatabaseSearch() {
    const databaseSearchDialog = this.dialog.open(DatabaseSearchComponent);
    databaseSearchDialog.afterClosed().subscribe((store: SimplifiedStore) => {
      if (store != null) {
        this.mapService.setCenter(this.siteService.getCoordinates(store.site));
        this.mapService.setZoom(17);
      }
    });
  }

  openGoogleSearch() {
    const googleSearchDialog = this.dialog.open(GoogleSearchComponent);
    googleSearchDialog.afterClosed().subscribe(result => {
      if (result != null) {
        // Create google point layer
        if (this.googlePlacesLayer == null) {
          this.googlePlacesLayer = new GooglePlaceLayer(this.mapService);
          this.googlePlacesLayer.markerClick$.subscribe((googlePlace: GooglePlace) => {
            if (this.casingDashboardService.getShouldOpenInfoCard()) {
              this.infoCard = new GoogleInfoCardItem(GoogleInfoCardComponent, googlePlace);
            }
          });
        }

        if (result.place != null) {
          this.googlePlacesLayer.setGooglePlaces([result.place]);
          this.mapService.setCenter(result.place.getCoordinates());
        } else if (result.query != null) {
          this.getGoogleLocationsInView(result.query, this.mapService.getBounds());
          if (this.googleSearchSubscription != null) {
            this.googleSearchSubscription.unsubscribe();
          }
          this.googleSearchSubscription = this.mapService.boundsChanged$.pipe(debounceTime(750))
            .subscribe(() => {
              this.getGoogleLocationsInView(result.query, this.mapService.getBounds());
            });
        }
      }
    });
  }

  getGoogleLocationsInView(query: string, bounds?: any) {
    this.mapService.searchFor(query, bounds).subscribe((searchResults: GooglePlace[]) => {
      if (searchResults.length) {
        this.ngZone.run(() => {
          this.googlePlacesLayer.setGooglePlaces(searchResults);
        });
      } else {
        const message = `No Google results found for '${query}'`;
        this.snackBar.open(message, null, { duration: 2000 });
      }
    }, err => {
      if (err === 'ZERO_RESULTS') {
        const message = `No Google results found for '${query}'`;
        this.snackBar.open(message, null, { duration: 2000 });
      }
    });
  }

  clearGoogleSearch() {
    if (this.googleSearchSubscription != null) {
      this.googleSearchSubscription.unsubscribe();
      this.googleSearchSubscription = null;
    }
    this.googlePlacesLayer.removeFromMap();
    this.googlePlacesLayer = null;
  }

  countSearchPoints(): string {
    if (this.googlePlacesLayer) {
      const markerCount = this.googlePlacesLayer.getMarkersCount();
      return markerCount ? markerCount.toLocaleString() : null;
    }
    return null;
  }

  openLatLngSearch() {
    const latLngSearchDialog = this.dialog.open(LatLngSearchComponent);
    latLngSearchDialog.afterClosed().subscribe((coordinates: Coordinates) => {
      console.log(coordinates);
      if (coordinates != null) {
        this.mapService.setCenter(coordinates);
        // Create layer
        const fm = new FindMeLayer(this.mapService, coordinates);
        // After 5 seconds remove it from the map
        setTimeout(() => {
          fm.removeFromMap();
        }, 3000);
      }
    });
  }

  /*
Assigning
 */
  openAssignmentDialog() {
    this.dialog.open(UserProfileSelectComponent).afterClosed()
      .subscribe(user => {
        if (user != null) {
          this.assignSelectedStoresToUser(user);
        }
      });
  }

  assignToSelf() {
    this.assign(this.authService.sessionUser.id);
  }

  assignSelectedStoresToUser(user: SimplifiedUserProfile) {
    this.assign((user != null) ? user.id : null);
  }

  private assign(userId: number) {
    this.updating = true;
    this.storeService.assignToUser(this.dbEntityMarkerService.getSelectedStoreIds(), userId)
      .pipe(finalize(() => this.updating = false))
      .subscribe((sites: SimplifiedSite[]) => {
        const message = `Successfully updated ${sites.length} Sites`;
        this.snackBar.open(message, null, { duration: 2000 });
        this.getEntitiesInBounds();
      }, err => this.errorService.handleServerError('Failed to update sites!', err,
        () => console.log(err),
        () => this.assign(userId)));
  }

  controlSideMenuClosed() {
    this.dbEntityMarkerService.refreshMarkers();
  }

  saveProjectBoundary() {
    this.savingBoundary = true;
    this.projectBoundaryService.saveProjectBoundaries()
      .pipe(finalize(() => this.savingBoundary = false))
      .subscribe(() => {
        this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
        this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);
      },
        err => this.errorService.handleServerError('Failed to save project boundary!', err,
          () => console.log(err),
          () => this.saveProjectBoundary()))
  }

  cancelProjectBoundaryEditing() {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);
    this.projectBoundaryService.cancelProjectBoundaryEditing();
  }

  enableProjectBoundaryEditing() {
    this.selectedDashboardMode = CasingDashboardMode.EDIT_PROJECT_BOUNDARY;
    this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);
    this.projectBoundaryService.enableProjectBoundaryEditing();
    this.projectBoundaryService.zoomToProjectBoundary();
  }

  showBoundary() {
    this.projectBoundaryService.showProjectBoundaries().subscribe(() => {
      this.projectBoundaryService.zoomToProjectBoundary();
    });
  }

  selectAllInBoundary() {
    this.dbEntityMarkerService.clearSelection();
    if (this.projectBoundaryService.isShowingBoundary()) {
      const geoJsonString = JSON.stringify(this.projectBoundaryService.projectBoundary.geojson);
      this.dbEntityMarkerService.selectInGeoJson(geoJsonString);
    } else {
      this.projectBoundaryService.showProjectBoundaries().subscribe(boundary => {
        if (boundary != null) {
          this.dbEntityMarkerService.selectInGeoJson(boundary.geojson);
          this.projectBoundaryService.zoomToProjectBoundary();
        } else {
          this.snackBar.open('No Boundary for Project', null, { duration: 2000, verticalPosition: 'top' });
        }
      });
    }
  }

  openDownloadDialog() {
    const config = { data: { selectedStoreIds: this.dbEntityMarkerService.getSelectedStoreIds() }, maxWidth: '90%' };
    const downloadDialog = this.dialog.open(DownloadDialogComponent, config);
    downloadDialog.afterClosed().subscribe(project => {
      if (project) {
        downloadDialog.close();
      }
    })
  }

  userIsGuest() {
    const role = this.authService.sessionUser.role;
    return (role && role.displayName === 'Guest Analyst');
  }

  onDuplicateSiteSelected(duplicateSiteId: number) {
    // If the user selects the same site (can't merge with self)
    if (this.selectedSiteId === duplicateSiteId) {
      // Display clarifying instructions to user
      const message = 'Oops, select ANY OTHER site to merge into this site';
      const ref = this.snackBar.open(message, 'Cancel');

      // If user clicks cancel, close snackbar and return to default mode
      ref.onAction().subscribe(() => {
        this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
        this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);
      });
    } else {
      // If the user successfully selects a different site

      // Change the mode back to default (for when they are done)
      this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
      this.casingDashboardService.setSelectedDashboardMode(this.selectedDashboardMode);

      // Dismiss the instructions
      this.snackBar.dismiss();

      // Open the dialog to allow the user to merge the two sites
      const siteMergeDialog = this.dialog.open(SiteMergeDialogComponent, {
        maxWidth: '90%',
        minWidth: '300px',
        disableClose: true,
        data: { duplicateSiteId: duplicateSiteId, selectedSiteId: this.selectedSiteId }
      });

      // When the user completes or cancels merging the sites, refresh the locations on the screen
      siteMergeDialog.afterClosed().subscribe(() => {
        this.dbEntityMarkerService.removeMarkerForSite(duplicateSiteId);
        this.dbEntityMarkerService.clearSelection();
        this.getEntitiesInBounds();
      });
    }
  }

  getSelectedStoreIds() {
    return this.dbEntityMarkerService.getSelectedStoreIds();
  }

  addToList() {
    const selectedIds = this.getSelectedStoreIds();
    if (selectedIds.length > 0) {
      const addRemoveDialogRef = this.dialog.open(AddRemoveStoresListDialogComponent, {
        data: {
          type: AddRemoveType.ADD,
          storeIds: selectedIds
        }
      });
      addRemoveDialogRef.afterClosed().subscribe(() => {
      });
    }
  }

  removeFromList() {
    const selectedIds = this.getSelectedStoreIds();
    if (selectedIds.length > 0) {
      this.dialog.open(AddRemoveStoresListDialogComponent, { data: { type: AddRemoveType.REMOVE, storeIds: selectedIds } });
    }
  }

  toggleStoreLists() {
    this.showStoreLists = !this.showStoreLists;
    this.storageService.set(this.storeListsStorageKey, this.showStoreLists);
  }

  handleSidenavClick(e: MouseEvent) {
    const sidenavWidth = document.querySelector('#store-sidenav')['offsetWidth'];
    const mouseX = e.x;

    // check if they are clicking the tab (::after)
    if (mouseX > sidenavWidth) {
      this.toggleStoreLists();
    }
  }

  getActiveStoreListName() {
    const activeStoreList = this.listManagerService.getSelectedStoreList();
    return activeStoreList ? activeStoreList.storeListName : '';
  }

  getVisibleMarkersCount() {
    return this.visibleStoresCount;
  }

  openSidenavDirectlyToSelectedListStores(storeList: SimplifiedStoreList) {
    if (storeList.id !== -1) {
      this.storeSidenavService.setPage(StoreSidenavPages.MYLISTS);
      this.listManagerService.setSelectedStoreList(new SimplifiedStoreList(storeList));
      setTimeout(() => {
        this.listManagerService.setPage(ListManagerPages.VIEWSTORES);
      }, 100)
    } else {
      this.storeSidenavService.setPage(StoreSidenavPages.STORESONMAP);
    }

    this.showStoreLists = true;
    this.filterSideNavIsOpen = false;
  }

  setStoreListOptions() {
    this.listManagerService.getStoreLists().subscribe((storeLists: SimplifiedStoreList[]) => {
      this.storeListOptions = [this.dbEntityMarkerService.allStoresOption].concat(storeLists);
    });
  }

  resetFilters() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reset All Filters',
        question: `Reset All Filters and Options to Default Values?`,
        options: ['Confirm']
      }
    });
    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'Confirm') {
        this.dbEntityMarkerService.setAllControls(null);
      }
    });
  }

  getActiveTypeNames() {
    const { showActive,
      showHistorical,
      showFuture,
      showEmptySites,
      showSitesBackfilledByNonGrocery,
      showFloat } = this.dbEntityMarkerService.controls.controls;

    const labels = [
      showActive.value ? 'Active' : '',
      showHistorical.value ? 'Historical' : '',
      showFuture.value ? 'Future' : '',
      showEmptySites.value ? 'Empty Sites' : '',
      showSitesBackfilledByNonGrocery.value ? 'Backfilled' : '',
      showFloat.value ? 'Float' : ''
    ];

    return labels.filter(l => l).join(', ') || 'Exclude All Types';
  }

  getActiveDatasetName() {
    return this.dbEntityMarkerService.controls.get('dataset').value.storeListName;
  }

  getActiveMarkerTypeName() {
    return this.dbEntityMarkerService.controls.get('markerType').value;
  }

  getActiveControlNames() {
    const {
      updateOnBoundsChange,
      cluster,
      fullLabelMinZoomLevel
    } = this.dbEntityMarkerService.controls.controls;

    const labels = [
      updateOnBoundsChange.value ? `Updating` : `NOT Updating`,
      cluster.value ? `Clustering` : '',
      fullLabelMinZoomLevel.value <= this.mapService.getZoom() ? `Labeling` : ''
    ];

    return labels.filter(l => l).join(', ');
  }

  getActiveStatusNames() {
    const {
      showClosed, showDeadDeal, showNewUnderConstruction, showOpen, showPlanned,
      showProposed, showRemodel, showRumored, showStrongRumor, showTemporarilyClosed
    } = this.dbEntityMarkerService.controls.controls;

    const labels = [
      showClosed.value ? StoreStatusOptions.CLOSED : '',
      showDeadDeal.value ? StoreStatusOptions.DEAD_DEAL : '',
      showNewUnderConstruction.value ? StoreStatusOptions.NEW_UNDER_CONSTRUCTION : '',
      showOpen.value ? StoreStatusOptions.OPEN : '',
      showPlanned.value ? StoreStatusOptions.PLANNED : '',
      showProposed.value ? StoreStatusOptions.PROPOSED : '',
      showRemodel.value ? StoreStatusOptions.REMODEL : '',
      showRumored.value ? StoreStatusOptions.RUMORED : '',
      showStrongRumor.value ? StoreStatusOptions.STRONG_RUMOR : '',
      showTemporarilyClosed.value ? StoreStatusOptions.TEMPORARILY_CLOSED : ''
    ];

    return labels.filter(l => l).join(', ') || 'Exclude All Statuses';
  }

  getActiveBannerName() {
    const { banner } = this.dbEntityMarkerService.controls.controls;
    return banner.value && banner.value.length ? banner.value.map(b => b.bannerName).join(', ') : null;
  }

  getActiveAssignmentName() {
    const { assignment } = this.dbEntityMarkerService.controls.controls;
    return assignment.value ? `${assignment.value.firstName} ${assignment.value.lastName}` : null;
  }

  getActiveBanners(): SimplifiedBanner[] {
    return this.dbEntityMarkerService.controls.get('banner').value;
  }

  selectBanner(banner?: SimplifiedBanner) {
    const config = { data: { remove: false }, maxWidth: '90%' };
    const dialog = this.dialog.open(SelectBannerComponent, config);
    dialog.afterClosed().subscribe((result) => {
      const activeBanners: SimplifiedBanner[] = this.getActiveBanners() || [];
      if (result && result.bannerName) {
        if (banner) {
          const idx = activeBanners.findIndex(b => b.id === banner.id);
          activeBanners[idx] = result;
        } else {
          activeBanners.push(result);
        }
        this.dbEntityMarkerService.controls.get('banner').setValue(activeBanners);
      }
    });
  }

  getBannerImageSrc(banner: SimplifiedBanner) {
    return banner ? this.bannerService.getBannerImageSrc(banner) : null;
  }

  clearBanner(banner: SimplifiedBanner) {
    const activeBanners = this.getActiveBanners().filter(b => b.id !== banner.id);
    this.dbEntityMarkerService.controls.get('banner').setValue(activeBanners);
  }

  selectAssignment() {
    this.dialog.open(UserProfileSelectComponent).afterClosed()
      .subscribe(user => {
        if (user != null) {
          this.dbEntityMarkerService.controls.get('assignment').setValue(user);
        }
      });
  }

  clearAssignment() {
    this.dbEntityMarkerService.controls.get('assignment').setValue(null);
  }

  saveFilter() {
    const dialogRef = this.dialog.open(TextInputDialogComponent, { data: { title: 'Filter Name', placeholder: 'Filter Name' } });
    dialogRef.afterClosed().subscribe(async (name: string) => {
      if (name) {

        let savedControls = await this.storageService.getOne(ControlStorageKeys.savedDbEntityMarkerServiceControls).toPromise();
        const activeControl = this.dbEntityMarkerService.controls.value;
        if (!savedControls) {
          savedControls = {};
        }
        savedControls[name] = new Control(name, new Date(), activeControl);

        this.dbEntityMarkerService.saveControlsToStorage(savedControls);
      }
    })
  }

  loadFilter(event) {
    const dialogRef = this.dialog.open(StoredControlsSelectionDialogComponent);
    dialogRef.afterClosed().subscribe((control: Control) => {
      if (control) {
        this.dbEntityMarkerService.loadControlsFromJson(control.control);
      }
    })
  }



}
