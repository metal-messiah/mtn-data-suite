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
import { MappableService } from '../../shared/mappable.service';
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
import { Observable, of, Subscription } from 'rxjs/index';
import { debounce, debounceTime, delay, finalize, mergeMap } from 'rxjs/internal/operators';
import { ProjectService } from '../../core/services/project.service';
import { Boundary } from '../../models/full/boundary';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MapPointLayer } from '../../models/map-point-layer';
import { CoordinateMappable } from '../../models/coordinate-mappable';

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
  styleUrls: ['./casing-dashboard.component.css'],
  providers: [MappableService]
})
export class CasingDashboardComponent implements OnInit {

  selectedStore: Store | SimplifiedStore;
  selectedSite: Site | SimplifiedSite;
  selectedGooglePlace: GooglePlace;

  // Layers
  pointLayer: MapPointLayer<CoordinateMappable>;
  storeMapLayer: EntityMapLayer<StoreMappable>;
  siteMapLayer: EntityMapLayer<SiteMappable>;
  newSiteLayer: NewSiteLayer;
  followMeLayer: FollowMeLayer;
  googlePlacesLayer: GooglePlaceLayer;

  // Flags
  showingBoundaries = false;
  sideNavIsOpen = false;
  filterSideNavIsOpen = false;

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
    this.pointLayer = new MapPointLayer<CoordinateMappable>();
    this.storeMapLayer = new EntityMapLayer<StoreMappable>(StoreMappable, this.authService.sessionUser);
    this.siteMapLayer = new EntityMapLayer<SiteMappable>(SiteMappable, this.authService.sessionUser);
    this.casingDashboardService.projectChanged$.subscribe(project => {
      this.showingBoundaries = false;
      this.mapService.clearGeoJsonBoundaries();
    })
  }

  onMapReady() {
    console.log(`Map is ready`);

    this.mapService.boundsChanged$.pipe(this.getDebounce())
      .subscribe(bounds => {
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
    return debounce(val => of(true)
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

  getEntities(bounds): void {
    if (this.mapService.getZoom() > 10) {
      this.pointLayer.clearMarkers();
      const storeTypes = this.getFilteredStoreTypes();
      if (storeTypes.length > 0) {
        this.getStoresInBounds(bounds);
      } else {
        this.storeMapLayer.setEntities([]);
        this.mapService.addPointLayer(this.storeMapLayer);
      }
      this.getSitesInBounds(bounds);
    } else if (this.mapService.getZoom() > 7) {
      this.getPoints(bounds);
      this.storeMapLayer.setEntities([]);
      this.mapService.addPointLayer(this.storeMapLayer);
      this.siteMapLayer.setEntities([]);
      this.mapService.addPointLayer(this.siteMapLayer);
    } else {
      this.ngZone.run(() => this.snackBar.open('Zoom in for location data', null, {
        duration: 1000,
        verticalPosition: 'top'
      }));
      this.pointLayer.clearMarkers();
      this.storeMapLayer.setEntities([]);
      this.mapService.addPointLayer(this.storeMapLayer);
      this.siteMapLayer.setEntities([]);
      this.mapService.addPointLayer(this.siteMapLayer);
    }
  }

  private getPoints(bounds) {
    this.siteService.getSitePointsInBounds(bounds).subscribe((sitePoints: Coordinates[]) => {
      this.mapService.addDataPoints(sitePoints);
      // const mappables = sitePoints.map(p => new CoordinateMappable({lat: p.latitude, lng: p.longitude}))
      // this.pointLayer.createMarkersFromMappables(mappables);
      // this.mapService.addPointLayer(this.pointLayer);
      this.ngZone.run(() => {
        const message = `Showing ${sitePoints.length} items`;
        this.snackBar.open(message, null, {duration: 2000, verticalPosition: 'top'});
      });
    })
  }

  private getSitesInBounds(bounds) {
    // Get Sites without stores
    this.siteService.getSitesWithoutStoresInBounds(bounds).subscribe(page => {
      this.siteMapLayer.setEntities(page.content);
      this.mapService.addPointLayer(this.siteMapLayer);
    }, err => {
      this.ngZone.run(() => {
        this.errorService.handleServerError(`Failed to retrieve sites!`, err,
          () => this.router.navigate(['/']),
          () => this.getSitesInBounds(bounds));
      });
    });
  }

  private getStoresInBounds(bounds) {
    this.storeService.getStoresOfTypeInBounds(bounds, this.getFilteredStoreTypes()).subscribe(page => {
      this.storeMapLayer.setEntities(page.content);
      this.mapService.addPointLayer(this.storeMapLayer);
      this.ngZone.run(() => {
        const message = `Showing ${page.numberOfElements} items of ${page.totalElements}`;
        this.snackBar.open(message, null, {duration: 1000, verticalPosition: 'top'});
      });
    }, err => {
      this.ngZone.run(() => {
        this.errorService.handleServerError(`Failed to retrieve stores!`, err,
          () => this.router.navigate(['/']),
          () => this.getStoresInBounds(bounds));
      });
    });
  }

  toggleSelectedProjectBoundaries(show: boolean): void {
    this.sideNavIsOpen = false;

    if (show) {
      this.projectService.getBoundaryForProject(this.casingDashboardService.getSelectedProject().id)
        .subscribe((boundary: Boundary) => {
          if (boundary == null) {
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'No Boundary',
                question: 'This project has no boundary',
                options: []
              }
            });
            this.showingBoundaries = false;
          } else {
            this.mapService.setGeoJsonBoundary(JSON.parse(boundary.geojson));
            this.showingBoundaries = true;
          }
        });
    } else {
      this.mapService.clearGeoJsonBoundaries();
      this.showingBoundaries = false;
    }
  }

  initSiteCreation(): void {
    this.sideNavIsOpen = false;
    this.selectedDashboardMode = CasingDashboardMode.CREATING_NEW;
    // Create new Layer for new Location
    this.newSiteLayer = new NewSiteLayer(this.mapService.getCenter());
    // Add Layer to map
    this.mapService.addPointLayer(this.newSiteLayer);
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
  }

  private createNewSite(site: Site) {
    // Create a new site from reverse geocode - make sharable via service
    const snackBarRef2 = this.snackBar.open('Creating new site...', null);
    this.siteService.create(site)
      .pipe(finalize(() => this.cancelSiteCreation()))
      .subscribe(() => {
        this.snackBar.open('Successfully created new Site', null, {duration: 1500});
        // TODO show in site layer
      }, err => {
        snackBarRef2.dismiss();
        this.cancelSiteCreation();
        this.errorService.handleServerError('Failed to create new Site!', err,
          () => {
          },
          () => this.createNewSite(site));
      });
  }

  /*
  Geo-location
   */
  findMe(): void {
    this.sideNavIsOpen = false;
    this.navigatorService.getCurrentPosition().subscribe(position => {
      this.mapService.setCenter(position);
      // Create layer
      const fm = new FindMeLayer(position);
      // Add it to the map
      this.mapService.addPointLayer(fm);
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
    this.followMeLayer = new FollowMeLayer(this.mapService.getCenter());
    this.mapService.addPointLayer(this.followMeLayer);
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
  }

  openDatabaseSearch() {
    const databaseSearchDialog = this.dialog.open(DatabaseSearchComponent);
    databaseSearchDialog.afterClosed().subscribe((store: SimplifiedStore) => {
      this.mapService.setCenter(this.siteService.getCoordinates(store.site));
      this.selectedCardState = CardState.SELECTED_STORE;
      setTimeout(() => this.storeMapLayer.selectEntity(store), 1000);
    });
  }

  openGoogleSearch() {
    const googleSearchDialog = this.dialog.open(GoogleSearchComponent);
    googleSearchDialog.afterClosed().subscribe(result => {
      if (result != null) {
        // Create google point layer
        if (this.googlePlacesLayer == null) {
          this.googlePlacesLayer = new GooglePlaceLayer();
          this.mapService.addPointLayer(this.googlePlacesLayer);
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
          this.getGoogleLocationInView(result.query);
          if (this.googleSearchSubscription != null) {
            this.googleSearchSubscription.unsubscribe();
          }
          this.googleSearchSubscription = this.mapService.boundsChanged$.pipe(debounceTime(750))
            .subscribe(() => this.getGoogleLocationInView(result.query));
        }
      }
    });
  }

  getGoogleLocationInView(query: string) {
    this.mapService.searchFor(query).subscribe((searchResults: GooglePlace[]) => {
      this.ngZone.run(() => this.googlePlacesLayer.setGooglePlaces(searchResults));
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
        const fm = new FindMeLayer(coordinates);
        // Add it to the map
        this.mapService.addPointLayer(fm);
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
    this.siteService.assignToUser(Array.from(selectedSiteIds), userId).subscribe((sites: Site[]) => {
      const message = `Successfully updated ${sites.length} Sites`;
      this.snackBar.open(message, null, {duration: 2000});
      this.getEntities(this.mapService.getBounds());
    });
  }

  filterClosed() {
    this.casingDashboardService.saveFilters().subscribe(() => console.log('Saved Filters'));
    this.getEntities(this.mapService.getBounds());
  }
}
