import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { MapService } from '../../core/services/map.service';
import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/full/site';
import { CasingDashboardService } from './casing-dashboard.service';
import { MarkerType } from '../../core/functionalEnums/MarkerType';
import { GeocoderService } from '../../core/services/geocoder.service';
import { NavigatorService } from '../../core/services/navigator.service';
import { FindMeLayer } from '../../models/find-me-layer';
import { FollowMeLayer } from '../../models/follow-me-layer';
import { LatLngSearchComponent } from '../lat-lng-search/lat-lng-search.component';
import { Coordinates } from '../../models/coordinates';
import { GoogleSearchComponent } from '../google-search/google-search.component';
import { GooglePlace } from '../../models/google-place';
import { StoreService } from '../../core/services/store.service';
import { DatabaseSearchComponent } from '../database-search/database-search.component';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';
import { UserProfileSelectComponent } from '../../shared/user-profile-select/user-profile-select.component';
import { SimplifiedUserProfile } from '../../models/simplified/simplified-user-profile';
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { Store } from '../../models/full/store';
import { NewSiteLayer } from '../../models/new-site-layer';
import { GooglePlaceLayer } from '../../models/google-place-layer';
import { MapSelectionMode } from '../enums/map-selection-mode';
import { SimplifiedSite } from '../../models/simplified/simplified-site';
import { Observable, of, Subscription } from 'rxjs';
import { debounce, debounceTime, delay, finalize, mergeMap, tap } from 'rxjs/internal/operators';
import { ProjectService } from '../../core/services/project.service';
import { MapDataLayer } from '../../models/map-data-layer';
import { ProjectBoundaryService } from '../services/project-boundary.service';
import { StoreMapLayer } from '../../models/store-map-layer';
import { SiteMapLayer } from '../../models/site-map-layer';
import { GeometryUtil } from '../../utils/geometry-util';
import { EntitySelectionService } from '../../core/services/entity-selection.service';
import { DownloadDialogComponent } from '../download-dialog/download-dialog.component';
import { SiteMergeDialogComponent } from '../site-merge-dialog/site-merge-dialog.component';

export enum CasingDashboardMode {
  DEFAULT, FOLLOWING, MOVING_MAPPABLE, CREATING_NEW, MULTI_SELECT, EDIT_PROJECT_BOUNDARY, DUPLICATE_SELECTION
}

export enum CardState {
  HIDDEN,
  SELECTED_STORE,
  SELECTED_SITE,
  GOOGLE
}

@Component({
  selector: 'mds-casing-dashboard',
  templateUrl: './casing-dashboard.component.html',
  styleUrls: ['./casing-dashboard.component.css']
})
export class CasingDashboardComponent implements OnInit, OnDestroy {

  private readonly MAX_DATA_ZOOM = 6;
  private readonly DATA_POINT_ZOOM = 9;

  selectedStore: Store | SimplifiedStore;
  selectedSite: Site | SimplifiedSite;
  selectedGooglePlace: GooglePlace;

  // Layers
  storeMapLayer: StoreMapLayer;
  siteMapLayer: SiteMapLayer;
  newSiteLayer: NewSiteLayer;
  followMeLayer: FollowMeLayer;
  googlePlacesLayer: GooglePlaceLayer;
  mapDataLayer: MapDataLayer;

  // Flags
  filterSideNavIsOpen = false;
  updating = false;
  gettingEntities = false;
  markCasedStores = false;
  savingBoundary = false;
  selecting = false;

  // Modes
  selectedDashboardMode: CasingDashboardMode = CasingDashboardMode.DEFAULT;
  selectedCardState = CardState.HIDDEN;

  // Enums for template
  casingDashboardMode = CasingDashboardMode;
  markerType = MarkerType;
  cardState = CardState;
  storeSelectionMode = MapSelectionMode;

  googleSearchSubscription: Subscription;

  subscriptions: Subscription[] = [];

  // Duplicate Selection
  selectedSiteId: number;

  constructor(public mapService: MapService,
              public geocoderService: GeocoderService,
              public casingDashboardService: CasingDashboardService,
              private siteService: SiteService,
              private storeService: StoreService,
              private projectService: ProjectService,
              private snackBar: MatSnackBar,
              private ngZone: NgZone,
              private router: Router,
              private route: ActivatedRoute,
              private navigatorService: NavigatorService,
              private dialog: MatDialog,
              private authService: AuthService,
              private errorService: ErrorService,
              public entitySelectionService: EntitySelectionService,
              public projectBoundaryService: ProjectBoundaryService) {
  }

  ngOnInit() {
    this.markCasedStores = (localStorage.getItem('markCasedStores') === 'true');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => s.unsubscribe());
  }

  onMapReady() {
    console.log(`Map is ready`);
    this.storeMapLayer = new StoreMapLayer(this.mapService, this.authService, this.entitySelectionService.storeIds, () => {
      const project = this.casingDashboardService.getSelectedProject();
      return project ? project.id : null;
    });
    this.siteMapLayer = new SiteMapLayer(this.mapService, this.authService, this.entitySelectionService.siteIds);
    this.mapDataLayer = new MapDataLayer(this.mapService.getMap(), this.authService.sessionUser.id, this.entitySelectionService.siteIds);

    this.subscriptions.push(this.mapService.boundsChanged$.pipe(this.getDebounce())
      .subscribe((bounds: { east, north, south, west }) => {
        if (this.selectedDashboardMode !== CasingDashboardMode.MOVING_MAPPABLE) {
          this.getEntities(bounds);
        }
      }));
    this.subscriptions.push(this.mapService.mapClick$.subscribe(() => {
      this.ngZone.run(() => this.selectedCardState = CardState.HIDDEN);
    }));
    this.subscriptions.push(this.storeMapLayer.selection$.subscribe((store: Store | SimplifiedStore) => {
      this.ngZone.run(() => {
        if (this.selectedDashboardMode === CasingDashboardMode.DEFAULT) {
          this.siteMapLayer.clearSelection();
          this.selectedStore = store;
          this.selectedCardState = CardState.SELECTED_STORE;
        } else if (this.selectedDashboardMode === CasingDashboardMode.DUPLICATE_SELECTION) {
          this.openSiteMergeDialog(store.site.id);
        }
      });
    }));
    this.subscriptions.push(this.siteMapLayer.selection$.subscribe((site: Site | SimplifiedSite) => {
      this.ngZone.run(() => {
        if (this.selectedDashboardMode === CasingDashboardMode.DEFAULT) {
          this.storeMapLayer.clearSelection();
          this.selectedSite = site;
          this.selectedCardState = CardState.SELECTED_SITE;
        } else if (this.selectedDashboardMode === CasingDashboardMode.DUPLICATE_SELECTION) {
          this.storeMapLayer.clearSelection();
          this.selectedSite = site;
          this.selectedCardState = CardState.HIDDEN;
          this.openSiteMergeDialog(site.id);
        }
      });
    }));
    this.subscriptions.push(this.casingDashboardService.projectChanged$.subscribe(() => {
      this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
      this.projectBoundaryService.hideProjectBoundaries();
      this.getEntities(this.mapService.getBounds());
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



  private getDebounce() {
    return debounce(() => of(true)
      .pipe(delay(this.followMeLayer != null ? 10000 : 1000)));
  }

  private getFilteredStoreTypes(): string[] {
    const types = [];
    if (this.casingDashboardService.filter.active) {
      types.push('ACTIVE');
    }
    if (this.casingDashboardService.filter.future) {
      types.push('FUTURE');
    }
    if (this.casingDashboardService.filter.historical) {
      types.push('HISTORICAL');
    }
    return types;
  }

  getEntities(bounds: { east, north, south, west }): void {
    if (this.mapService.getZoom() > this.DATA_POINT_ZOOM) {
      this.mapDataLayer.clearDataPoints();
      const storeTypes = this.getFilteredStoreTypes();
      this.gettingEntities = true;
      this.getSitesInBounds(bounds)
        .pipe(finalize(() => this.gettingEntities = false))
        .pipe(mergeMap(() => {
          if (storeTypes.length > 0) {
            return this.getStoresInBounds(bounds);
          } else {
            this.storeMapLayer.setEntities([]);
            return of(null);
          }
        }))
        .subscribe(() => console.log('Retrieved Entities')
          , err => {
            this.ngZone.run(() => {
              this.errorService.handleServerError(`Failed to retrieve entities!`, err,
                () => console.log(err),
                () => this.getEntities(bounds));
            });
          });
    } else if (this.mapService.getZoom() > this.MAX_DATA_ZOOM) {
      this.getPointsInBounds(bounds);
      this.storeMapLayer.setEntities([]);
      this.siteMapLayer.setEntities([]);
    } else {
      this.ngZone.run(() => this.snackBar.open('Zoom in for location data', null, {
        duration: 1000,
        verticalPosition: 'top'
      }));
      this.mapDataLayer.clearDataPoints();
      this.storeMapLayer.setEntities([]);
      this.siteMapLayer.setEntities([]);
    }
  }

  private getPointsInBounds(bounds) {
    this.siteService.getSitePointsInBounds(bounds).subscribe((sitePoints: Coordinates[]) => {
      if (sitePoints.length <= 1000) {
        this.mapDataLayer.setDataPoints(sitePoints);
        this.ngZone.run(() => {
          const message = `Showing ${sitePoints.length} items`;
          this.snackBar.open(message, null, {duration: 2000, verticalPosition: 'top'});
        });
      } else {
        this.ngZone.run(() => {
          this.mapDataLayer.clearDataPoints();
          const message = `Too many locations, zoom in to see data`;
          this.snackBar.open(message, null, {duration: 2000, verticalPosition: 'top'});
        });
      }
    })
  }

  private getSitesInBounds(bounds) {
    // Get Sites without stores
    return this.siteService.getSitesWithoutStoresInBounds(bounds).pipe(tap(list => this.siteMapLayer.setEntities(list)));
  }

  private getStoresInBounds(bounds) {
    const includeProjectIds = this.storeMapLayer.markerType === MarkerType.PROJECT_COMPLETION;
    return this.storeService.getStoresOfTypeInBounds(bounds, this.getFilteredStoreTypes(), includeProjectIds)
      .pipe(tap(list => this.storeMapLayer.setEntities(list)));
  }

  initSiteCreation(): void {
    this.selectedDashboardMode = CasingDashboardMode.CREATING_NEW;
    // Create new Layer for new Location
    this.newSiteLayer = new NewSiteLayer(this.mapService, this.mapService.getCenter());
  }

  cancelDuplicateSelection(): void {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;

  }

  cancelSiteCreation(): void {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    // Remove layer from map
    this.newSiteLayer.removeFromMap();
    // Delete new Location layer
    this.newSiteLayer = null;
  }

  editNewLocation(): void {
    const coordinates = this.newSiteLayer.getCoordinatesOfNewSite();
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
          this.snackBar.open('Successfully created new Site', null, {duration: 1500});
          this.getEntities(this.mapService.getBounds());
          // TODO show in site layer
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
    this.followMeLayer = new FollowMeLayer(this.mapService, this.mapService.getCenter());
    this.navigatorService.watchPosition({maximumAge: 2000}).subscribe(
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

    this.navigatorService.cancelWatch();
    this.followMeLayer.removeFromMap();
    this.followMeLayer = null;
  }

  /*
  Move Store
   */
  moveStore(store: SimplifiedStore) {
    this.selectedDashboardMode = CasingDashboardMode.MOVING_MAPPABLE;
    this.storeMapLayer.startMovingEntity(store);
  }

  moveSite(site: SimplifiedSite) {
    this.selectedDashboardMode = CasingDashboardMode.MOVING_MAPPABLE;
    this.siteMapLayer.startMovingEntity(site);
  }

  cancelMove() {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    this.storeMapLayer.cancelMovingEntity();
    this.siteMapLayer.cancelMovingEntity();
  }

  saveMove() {
    if (this.storeMapLayer.isMoving()) {
      this.saveMovedStore();
    } else if (this.siteMapLayer.isMoving()) {
      this.saveMovedSite();
    }
  }

  saveMovedStore() {
    // Get new coordinates
    const movedStore: Store = this.storeMapLayer.getMovedEntity() as Store;
    const coordinates = this.storeMapLayer.getMovedEntityCoordinates();
    this.updateSiteCoordinates(movedStore.site.id, coordinates)
      .subscribe(() => {
        this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
        this.storeMapLayer.finishMovingEntity();
        this.getEntities(this.mapService.getBounds());
      }, err => this.errorService.handleServerError('Failed to update new Store location!', err,
        () => console.log('Cancel'),
        () => this.saveMovedStore()));
  }

  saveMovedSite() {
    // Get new coordinates
    const movedSite: Site = this.siteMapLayer.getMovedEntity() as Site;
    const coordinates = this.siteMapLayer.getMovedEntityCoordinates();
    this.updateSiteCoordinates(movedSite.id, coordinates)
      .subscribe(() => {
        this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
        this.siteMapLayer.finishMovingEntity();
        this.getEntities(this.mapService.getBounds());
      }, err => this.errorService.handleServerError('Failed to update new Site location!', err,
        () => console.log('Cancel'),
        () => this.saveMovedSite()));
  }

  updateSiteCoordinates(siteId: number, coordinates: Coordinates): Observable<Site> {
    return this.siteService.getOneById(siteId)
      .pipe(mergeMap((site: Site) => {
        // Save updated values
        site.latitude = coordinates.lat;
        site.longitude = coordinates.lng;
        return this.siteService.update(site);
      }));
  }

  /*
  Multi-select
   */
  enableMultiSelect(): void {
    this.selectedDashboardMode = CasingDashboardMode.MULTI_SELECT;
    this.storeMapLayer.clearSelection();
    this.storeMapLayer.selectionMode = MapSelectionMode.MULTI_SELECT;
    // Activate Map Drawing Tools and listen for completed Shapes
    this.mapService.activateDrawingTools().subscribe(shape => {
      const geoJson = GeometryUtil.getGeoJsonFromShape(shape);
      let observable: Observable<{ siteIds: number[], storeIds: number[] }>;
      if (geoJson.geometry.type === 'Point') {
        const longitude = geoJson.geometry.coordinates[0];
        const latitude = geoJson.geometry.coordinates[1];
        const radiusMeters = geoJson.properties.radius;
        observable = this.storeService.getIdsInRadius(latitude, longitude, radiusMeters, this.casingDashboardService.filter);
      } else {
        observable = this.storeService.getIdsInShape(JSON.stringify(geoJson), this.casingDashboardService.filter);
      }
      this.selecting = true;
      observable.pipe(finalize(() => {
        this.selecting = false;
        this.ngZone.run(() => {
          this.mapService.clearDrawings();
        });
      }))
        .subscribe((ids: { siteIds: number[], storeIds: number[] }) => {
          if (this.storeMapLayer.selectionMode === MapSelectionMode.MULTI_SELECT) {
            ids.storeIds.forEach(storeId => this.entitySelectionService.storeIds.add(storeId));
            ids.siteIds.forEach(siteId => this.entitySelectionService.siteIds.add(siteId));
          } else if (this.storeMapLayer.selectionMode === MapSelectionMode.MULTI_DESELECT) {
            ids.storeIds.forEach(storeId => this.entitySelectionService.storeIds.delete(storeId));
            ids.siteIds.forEach(siteId => this.entitySelectionService.siteIds.delete(siteId));
          }
          this.storeMapLayer.refreshOptions();
          console.log(this.mapService.getZoom());
          if (this.mapService.getZoom() <= this.DATA_POINT_ZOOM && this.mapService.getZoom() > this.MAX_DATA_ZOOM) {
            this.mapDataLayer.refresh();
          }
        })
    });
  }

  cancelMultiSelect(): void {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    this.storeMapLayer.selectionMode = MapSelectionMode.SINGLE_SELECT;
    this.entitySelectionService.clearSelectedIds();
    if (this.mapService.getZoom() > this.MAX_DATA_ZOOM && this.mapService.getZoom() <= this.DATA_POINT_ZOOM) {
      this.mapDataLayer.refresh();
    }
    this.mapService.deactivateDrawingTools();
    this.storeMapLayer.clearSelection();
  }

  setMarkerType(markerType: MarkerType) {
    this.storeMapLayer.setMarkerType(markerType);
    if (this.storeMapLayer.markerType === MarkerType.PROJECT_COMPLETION) {
      // Need to retrieve cased Project Ids
      this.getEntities(this.mapService.getBounds());
    } else {
      this.storeMapLayer.refreshOptions();
    }
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
            this.selectedGooglePlace = googlePlace;
            this.selectedCardState = CardState.GOOGLE;
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
      this.ngZone.run(() => {
        this.googlePlacesLayer.setGooglePlaces(searchResults);
      });
    });
  }

  clearGoogleSearch() {
    this.selectedCardState = CardState.HIDDEN;
    if (this.googleSearchSubscription != null) {
      this.googleSearchSubscription.unsubscribe();
      this.googleSearchSubscription = null;
    }
    this.googlePlacesLayer.removeFromMap();
    this.googlePlacesLayer = null;
  }

  saveGooglePlaceAsStore() {
    this.mapService.getDetailedGooglePlace(this.selectedGooglePlace).subscribe(googlePlace => {
      console.log(googlePlace);
      // TODO
      // const newSite = new Site({
      //   latitude: googlePlace.getCoordinates().lat,
      //   longitude: googlePlace.getCoordinates().lng,
      //   type: 'ACTIVE',
      //   address1: googlePlace.address_components.,
      //   city: string,
      //   county: string,
      //   state: string,
      //   postalCode: string,
      //   country: string,
      //   intersectionType: string,
      //   quad: string,
      //   intersectionStreetPrimary: string,
      //   intersectionStreetSecondary: string
      // });
    });
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

  onStoreUpdated(store: SimplifiedStore) {
    this.ngZone.run(() => this.storeMapLayer.updateEntity(store));
  }

  onSiteUpdated(site: SimplifiedSite) {
    this.ngZone.run(() => this.siteMapLayer.updateEntity(site));
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
    const selectedStoreIds = this.storeMapLayer.getSelectedEntityIds();
    this.updating = true;
    this.storeService.assignToUser(selectedStoreIds, userId)
      .pipe(finalize(() => this.updating = false))
      .subscribe((sites: SimplifiedSite[]) => {
        const message = `Successfully updated ${sites.length} Sites`;
        this.snackBar.open(message, null, {duration: 2000});
        this.getEntities(this.mapService.getBounds());
      }, err => this.errorService.handleServerError('Failed to update sites!', err,
        () => console.log(err),
        () => this.assign(userId)));
  }

  filterClosed() {
    this.casingDashboardService.saveFilters().subscribe(() => console.log('Saved Filters'));
    this.getEntities(this.mapService.getBounds());
  }

  saveProjectBoundary() {
    this.savingBoundary = true;
    this.projectBoundaryService.saveProjectBoundaries()
      .pipe(finalize(() => this.savingBoundary = false))
      .subscribe(() => this.selectedDashboardMode = CasingDashboardMode.DEFAULT,
        err => this.errorService.handleServerError('Failed to save project boundary!', err,
          () => console.log(err),
          () => this.saveProjectBoundary()))
  }

  cancelProjectBoundaryEditing() {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    this.projectBoundaryService.cancelProjectBoundaryEditing();
  }

  enableProjectBoundaryEditing() {
    this.selectedDashboardMode = CasingDashboardMode.EDIT_PROJECT_BOUNDARY;
    this.projectBoundaryService.enableProjectBoundaryEditing();
    this.projectBoundaryService.zoomToProjectBoundary();
  }

  showBoundary() {
    this.projectBoundaryService.showProjectBoundaries().subscribe();
    this.projectBoundaryService.zoomToProjectBoundary();
  }

  selectAllInBoundary() {
    if (this.projectBoundaryService.isShowingBoundary()) {
      const geoJsonString = JSON.stringify(this.projectBoundaryService.projectBoundary.geojson);
      this.selectAllInShape(geoJsonString, true);
    } else {
      this.projectBoundaryService.showProjectBoundaries().subscribe(boundary => {
        if (boundary != null) {
          this.selectAllInShape(boundary.geojson, true);
        } else {
          this.snackBar.open('No Boundary for Project', null, {duration: 2000, verticalPosition: 'top'});
        }
      });
      this.projectBoundaryService.zoomToProjectBoundary();
    }
  }

  private selectAllInShape(geoJsonString: string, clearPreviousSelection: boolean) {
    this.storeService.getIdsInShape(geoJsonString, this.casingDashboardService.filter)
      .subscribe((ids: { siteIds: number[], storeIds: number[] }) => {
        if (clearPreviousSelection) {
          this.entitySelectionService.clearSelectedIds();
        }
        ids.storeIds.forEach(storeId => this.entitySelectionService.storeIds.add(storeId));
        ids.siteIds.forEach(siteId => this.entitySelectionService.siteIds.add(siteId));
        this.storeMapLayer.refreshOptions();
        if (this.mapService.getZoom() <= this.DATA_POINT_ZOOM && this.mapService.getZoom() > this.MAX_DATA_ZOOM) {
          this.mapDataLayer.refresh();
        }
      })
  }

  openDownloadDialog() {
    const config = {data: {selectedStoreIds: this.storeMapLayer.getSelectedEntityIds()}, maxWidth: '90%'};
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

  initiateDuplicateSelection(siteId: number) {
    this.selectedDashboardMode = CasingDashboardMode.DUPLICATE_SELECTION;
    this.selectedSiteId = siteId;
  }

  openSiteMergeDialog(duplicateSiteId: number) {
    const siteMergeDialog = this.dialog.open(SiteMergeDialogComponent, {
      maxWidth: '90%',
      data: {duplicateSiteId: duplicateSiteId, selectedSiteId: this.selectedSiteId}
    });
    siteMergeDialog.afterClosed().subscribe( result => {
      console.log(result);
      this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
      this.getEntities(this.mapService.getBounds());
    })
  }
}
