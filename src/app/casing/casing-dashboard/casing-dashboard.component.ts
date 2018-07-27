import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

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
import { EntityMapLayer } from '../../models/entity-map-layer';
import { Store } from '../../models/full/store';
import { NewSiteLayer } from '../../models/new-site-layer';
import { GooglePlaceLayer } from '../../models/google-place-layer';
import { MapSelectionMode } from '../enums/map-selection-mode';
import { StoreMappable } from 'app/models/store-mappable';
import { SiteMappable } from '../../models/site-mappable';
import { SimplifiedSite } from '../../models/simplified/simplified-site';
import { Observable, of, Subscription } from 'rxjs';
import { debounce, debounceTime, delay, finalize, mergeMap, tap } from 'rxjs/internal/operators';
import { ProjectService } from '../../core/services/project.service';
import { Boundary } from '../../models/full/boundary';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MapDataLayer } from '../../models/map-data-layer';

export enum MultiSelectToolTypes {
  CLICK, CIRCLE, RECTANGLE, POLYGON
}

export enum CasingDashboardMode {
  DEFAULT, FOLLOWING, MOVING_MAPPABLE, CREATING_NEW, MULTI_SELECT
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
export class CasingDashboardComponent implements OnInit {

  selectedStore: Store | SimplifiedStore;
  selectedSite: Site | SimplifiedSite;
  selectedGooglePlace: GooglePlace;

  // Layers
  storeMapLayer: EntityMapLayer<StoreMappable>;
  siteMapLayer: EntityMapLayer<SiteMappable>;
  newSiteLayer: NewSiteLayer;
  followMeLayer: FollowMeLayer;
  googlePlacesLayer: GooglePlaceLayer;
  mapDataLayer: MapDataLayer;

  // Flags
  showingBoundaries = false;
  sideNavIsOpen = false;
  filterSideNavIsOpen = false;
  updating = false;
  gettingEntities = false;

  // Modes
  selectedDashboardMode: CasingDashboardMode = CasingDashboardMode.DEFAULT;
  selectedMultiSelectTool = MultiSelectToolTypes.CLICK;
  selectedCardState = CardState.HIDDEN;

  // Enums for template
  casingDashboardMode = CasingDashboardMode;
  multiSelectToolType = MultiSelectToolTypes;
  markerType = MarkerType;
  cardState = CardState;
  storeSelectionMode = MapSelectionMode;

  googleSearchSubscription: Subscription;

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
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.casingDashboardService.projectChanged$.subscribe(() => {
      this.showingBoundaries = false;
      this.mapDataLayer.clearGeoJsonBoundaries();
      this.getEntities(this.mapService.getBounds());
    });
    this.casingDashboardService.toggleMarkingStores$.subscribe(() => {
      this.getEntities(this.mapService.getBounds());
    });
    this.casingDashboardService.toggleProjectBoundary$.subscribe(doShow => this.toggleSelectedProjectBoundaries(doShow));
  }

  onMapReady() {
    console.log(`Map is ready`);
    this.storeMapLayer = new EntityMapLayer<StoreMappable>(this.mapService.getMap(), (store: SimplifiedStore) => {
      return new StoreMappable(store, this.authService.sessionUser.id, () => this.casingDashboardService.getSelectedProject().id)
    });
    this.siteMapLayer = new EntityMapLayer<SiteMappable>(this.mapService.getMap(), (site: SimplifiedSite) => {
      return new SiteMappable(site, this.authService.sessionUser.id);
    });
    this.mapDataLayer = new MapDataLayer(this.mapService.getMap(), this.authService.sessionUser.id);

    this.mapService.boundsChanged$.pipe(this.getDebounce())
      .subscribe((bounds: { east, north, south, west }) => {
        if (this.selectedDashboardMode !== CasingDashboardMode.MOVING_MAPPABLE) {
          this.getEntities(bounds);
        }
      });
    this.mapService.mapClick$.subscribe(() => {
      this.ngZone.run(() => this.selectedCardState = CardState.HIDDEN);
    });
    this.storeMapLayer.selection$.subscribe((store: Store | SimplifiedStore) => {
      this.ngZone.run(() => {
        if (this.selectedDashboardMode === CasingDashboardMode.DEFAULT) {
          this.siteMapLayer.clearSelection();
          this.selectedStore = store;
          this.selectedCardState = CardState.SELECTED_STORE;
        }
      });
    });
    this.siteMapLayer.selection$.subscribe((site: Site | SimplifiedSite) => {
      this.ngZone.run(() => {
        if (this.selectedDashboardMode === CasingDashboardMode.DEFAULT) {
          this.storeMapLayer.clearSelection();
          this.selectedSite = site;
          this.selectedCardState = CardState.SELECTED_SITE;
        }
      });
    });
  }

  private getDebounce() {
    return debounce(() => of(true)
      .pipe(delay(this.followMeLayer != null ? 10000 : 1000)));
  }

  private getFilteredStoreTypes(): string[] {
    const types = [];
    if (this.casingDashboardService.includeActive) {
      types.push('ACTIVE');
    }
    if (this.casingDashboardService.includeFuture) {
      types.push('FUTURE');
    }
    if (this.casingDashboardService.includeHistorical) {
      types.push('HISTORICAL');
    }
    return types;
  }

  getEntities(bounds: { east, north, south, west }): void {
    if (this.mapService.getZoom() > 10) {
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
    } else if (this.mapService.getZoom() > 7) {
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
          const message = `Too many locations, zoom in to see data`;
          this.snackBar.open(message, null, {duration: 2000, verticalPosition: 'top'});
        });
      }
    })
  }

  private getSitesInBounds(bounds) {
    // Get Sites without stores
    return this.siteService.getSitesWithoutStoresInBounds(bounds).pipe(tap(page => {
      this.siteMapLayer.setEntities(page.content);
    }));
  }

  private getStoresInBounds(bounds) {
    return this.storeService.getStoresOfTypeInBounds(bounds, this.getFilteredStoreTypes(), this.casingDashboardService.markCasedStores)
      .pipe(tap(page => {
        this.storeMapLayer.setEntities(page.content);
        this.ngZone.run(() => {
          const message = `Showing ${page.numberOfElements} items of ${page.totalElements}`;
          this.snackBar.open(message, null, {duration: 1000, verticalPosition: 'top'});
        });
      }));
  }

  toggleSelectedProjectBoundaries(show: boolean): void {
    this.sideNavIsOpen = false;

    if (show) {
      this.projectService.getBoundaryForProject(this.casingDashboardService.getSelectedProject().id)
        .subscribe((boundary: Boundary) => {
          if (boundary == null) {
            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'No Boundary',
                question: 'This project has no boundary',
                options: []
              }
            });
            this.showingBoundaries = false;
          } else {
            this.mapDataLayer.setGeoJsonBoundary(JSON.parse(boundary.geojson));
            this.showingBoundaries = true;
          }
        });
    } else {
      this.mapDataLayer.clearGeoJsonBoundaries();
      this.showingBoundaries = false;
    }
  }

  initSiteCreation(): void {
    this.sideNavIsOpen = false;
    this.selectedDashboardMode = CasingDashboardMode.CREATING_NEW;
    // Create new Layer for new Location
    this.newSiteLayer = new NewSiteLayer(this.mapService.getMap(), this.mapService.getCenter());
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
    this.sideNavIsOpen = false;
    this.navigatorService.getCurrentPosition().subscribe(position => {
      this.mapService.setCenter(position);
      // Create layer
      const fm = new FindMeLayer(this.mapService.getMap(), position);
      // After 5 seconds remove it from the map
      setTimeout(() => {
        fm.removeFromMap();
      }, 5000);
      // Garbage collect will destroy it...
    });
  }

  activateFollowMe(): void {
    this.sideNavIsOpen = false;
    this.selectedDashboardMode = CasingDashboardMode.FOLLOWING;
    this.followMeLayer = new FollowMeLayer(this.mapService.getMap(), this.mapService.getCenter());
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
    this.sideNavIsOpen = false;

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
    this.sideNavIsOpen = false;
    this.selectedDashboardMode = CasingDashboardMode.MULTI_SELECT;
    this.storeMapLayer.clearSelection();
    this.storeMapLayer.selectionMode = MapSelectionMode.MULTI_SELECT;
    // Activate Map Drawing Tools and listen for completed Shapes
    this.mapService.activateDrawingTools().subscribe(shape => {
      // TODO - Not all stores may be mapped as user draws polygon and pans screen
      if (this.storeMapLayer.selectionMode === MapSelectionMode.MULTI_SELECT) {
        this.storeMapLayer.selectEntitiesInShape(shape);
      } else if (this.storeMapLayer.selectionMode === MapSelectionMode.MULTI_DESELECT) {
        this.storeMapLayer.deselectEntitiesInShape(shape);
      }
      this.ngZone.run(() => {
        this.mapService.clearDrawings();
      });
    });
  }

  cancelMultiSelect(): void {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    this.storeMapLayer.selectionMode = MapSelectionMode.SINGLE_SELECT;
    this.mapService.deactivateDrawingTools();
    this.storeMapLayer.clearSelection();
  }

  setMultiSelectTool(tool: MultiSelectToolTypes) {
    this.selectedMultiSelectTool = tool;
    if (tool === MultiSelectToolTypes.CLICK) {
      this.mapService.setDrawingModeToClick();
    } else if (tool === MultiSelectToolTypes.CIRCLE) {
      this.mapService.setDrawingModeToCircle();
    } else if (tool === MultiSelectToolTypes.RECTANGLE) {
      this.mapService.setDrawingModeToRectangle();
    } else if (tool === MultiSelectToolTypes.POLYGON) {
      this.mapService.setDrawingModeToPolygon();
    }
  }

  setMarkerType(markerType: MarkerType) {
    this.sideNavIsOpen = false;
    this.storeMapLayer.setMarkerType(markerType);
    this.getEntities(this.mapService.getBounds());
  }

  openDatabaseSearch() {
    const databaseSearchDialog = this.dialog.open(DatabaseSearchComponent);
    databaseSearchDialog.afterClosed().subscribe((store: SimplifiedStore) => {
      if (store != null) {
        this.mapService.setCenter(this.siteService.getCoordinates(store.site));
        this.selectedCardState = CardState.SELECTED_STORE;
        setTimeout(() => this.storeMapLayer.selectEntity(store), 1500);
      }
    });
  }

  openGoogleSearch() {
    const googleSearchDialog = this.dialog.open(GoogleSearchComponent);
    googleSearchDialog.afterClosed().subscribe(result => {
      if (result != null) {
        // Create google point layer
        if (this.googlePlacesLayer == null) {
          this.googlePlacesLayer = new GooglePlaceLayer(this.mapService.getMap());
          this.googlePlacesLayer.markerClick$.subscribe((googlePlace: GooglePlace) => {
            console.log(googlePlace);
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
        const fm = new FindMeLayer(this.mapService.getMap(), coordinates);
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

  assignSelectedStoresToUser(user: SimplifiedUserProfile) {
    const selectedSiteIds: Set<number> = new Set();
    this.storeMapLayer.getSelectedEntities().forEach((store: Store) => {
      selectedSiteIds.add(store.site.id);
    });
    const userId = (user != null) ? user.id : null;
    this.updating = true;
    this.siteService.assignToUser(Array.from(selectedSiteIds), userId)
      .pipe(finalize(() => this.updating = false))
      .subscribe((sites: Site[]) => {
        const message = `Successfully updated ${sites.length} Sites`;
        this.snackBar.open(message, null, {duration: 2000});
        this.getEntities(this.mapService.getBounds());
      }, err => this.errorService.handleServerError('Failed to update sites!', err,
        () => console.log(err),
        () => this.assignSelectedStoresToUser(user)));
  }

  filterClosed() {
    this.casingDashboardService.saveFilters().subscribe(() => console.log('Saved Filters'));
    this.getEntities(this.mapService.getBounds());
  }
}
