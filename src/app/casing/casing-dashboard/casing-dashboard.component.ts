import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { MapService } from '../../core/services/map.service';
import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/site';
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
import { Subscription } from 'rxjs/Subscription';
import { StoreService } from '../../core/services/store.service';
import { MappableService } from '../../shared/mappable.service';
import { DatabaseSearchComponent } from '../database-search/database-search.component';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';
import { UserProfileSelectComponent } from '../../shared/user-profile-select/user-profile-select.component';
import { SimplifiedUserProfile } from '../../models/simplified-user-profile';
import { SimplifiedStore } from '../../models/simplified-store';
import { StoreMapLayer } from '../../models/store-map-layer';
import { Store } from '../../models/store';
import { NewSiteLayer } from '../../models/new-site-layer';
import { GooglePlaceLayer } from '../../models/google-place-layer';
import { StoreSelectionMode } from '../enums/store-selection-mode';

export enum MultiSelectToolTypes {
  CLICK, CIRCLE, RECTANGLE, POLYGON
}

export enum MultiSelectMode {
  SELECT, DESELECT
}

export enum CasingDashboardMode {
  DEFAULT, FOLLOWING, MOVING_MAPPABLE, CREATING_NEW, MULTI_SELECT
}

export enum CardState {
  HIDDEN,
  SELECTED_MAPPABLE,
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
  selectedGooglePlace: GooglePlace;

  // Layers
  storeMapLayer: StoreMapLayer;
  newSiteLayer: NewSiteLayer;
  followMeLayer: FollowMeLayer;
  googlePlacesLayer: GooglePlaceLayer;

  // Flags
  showingBoundaries = false;
  sideNavIsOpen = false;

  // Modes
  selectedDashboardMode: CasingDashboardMode = CasingDashboardMode.DEFAULT;
  selectedMultiSelectTool = MultiSelectToolTypes.CLICK;
  selectedCardState = CardState.HIDDEN;

  // Enums for template
  casingDashboardMode = CasingDashboardMode;
  multiSelectToolType = MultiSelectToolTypes;
  markerType = MarkerType;
  cardState = CardState;
  storeSelectionMode = StoreSelectionMode;

  googleSearchSubscription: Subscription;

  constructor(public mapService: MapService,
              public geocoderService: GeocoderService,
              public casingDashboardService: CasingDashboardService,
              private siteService: SiteService,
              private storeService: StoreService,
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
    this.storeMapLayer = new StoreMapLayer(this.authService.sessionUser);
  }

  onMapReady(map) {
    console.log(`Map is ready: ${map}`);
    this.casingDashboardService.getSavedPerspective().subscribe(perspective => {
      if (perspective != null) {
        this.mapService.setCenter({lat: perspective.latitude, lng: perspective.longitude});
        this.mapService.setZoom(perspective.zoom);
      } else {
        this.mapService.setCenter({lat: 40.356714, lng: -111.770421});
        this.mapService.setZoom(10);
      }
    });

    this.mapService.boundsChanged$.pipe(debounceTime(750)).subscribe(bounds => {
      const perspective = this.mapService.getPerspective();
      this.casingDashboardService.savePerspective(perspective).subscribe();
      if (this.selectedDashboardMode !== CasingDashboardMode.MOVING_MAPPABLE) {
        this.getActiveStores(bounds);
      }
    });
    this.mapService.mapClick$.subscribe((coords: object) => {
      this.ngZone.run(() => this.selectedCardState = CardState.HIDDEN);
    });
    this.storeMapLayer.storeSelection$.subscribe((store: Store | SimplifiedStore) => {
      this.ngZone.run(() => {
        if (this.selectedDashboardMode === CasingDashboardMode.DEFAULT) {
          this.selectedStore = store;
          this.selectedCardState = CardState.SELECTED_MAPPABLE;
        }
      });
    });
  }

  getActiveStores(bounds): void {
    console.log('Getting Stores');
    this.storeService.getStoresOfTypeInBounds(bounds).subscribe(page => {
      this.storeMapLayer.setStores(page.content);
      this.mapService.addPointLayer(this.storeMapLayer);
      this.ngZone.run(() => {
        const message = `Showing ${page.numberOfElements} items of ${page.totalElements}`;
        this.snackBar.open(message, null, {duration: 1000, verticalPosition: 'top'});
      });
    }, err => {
      this.ngZone.run(() => {
        this.errorService.handleServerError(`Failed to retrieve stores!`, err,
          () => this.router.navigate(['/']));
      });
    });
  }

  toggleSelectedProjectBoundaries(show: boolean): void {
    this.showingBoundaries = show;
    // TODO get boundaries
    // TODO map boundaries
    // TODO fit map to boundaries
  }

  createNewSite(): void {
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
    this.geocoderService.reverseGeocode(coordinates).subscribe((address: Site) => {
      // If reverse geocode is successful - exit creation state (moving on to site page)
      this.cancelSiteCreation();
      // Create a new site from reverse geocode - make sharable via service
      this.casingDashboardService.newSite = new Site(address);
      // Navigate to site detail to edit site before saving to DB
      this.router.navigate(['site-detail'], {relativeTo: this.route});
    }, (err) => console.error(err));
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
  moveStore(store) {
    this.selectedDashboardMode = CasingDashboardMode.MOVING_MAPPABLE;
    this.storeMapLayer.startMovingStore(store);
  }

  cancelStoreMove() {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    this.storeMapLayer.cancelMovingStore();
  }

  saveStoreMove() {
    // Get new coordinates
    const movedStore = this.storeMapLayer.getMovedStore();
    const coordinates = this.storeMapLayer.getMovedStoreCoordinates();
    // Get Full version of site
    this.siteService.getOneById(movedStore.site.id).subscribe((site: Site) => {
      // Save updated values
      site.latitude = coordinates.lat;
      site.longitude = coordinates.lng;

      this.siteService.update(site).subscribe(updatedSite => {
        this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
        this.storeMapLayer.cancelMovingStore();
        this.getActiveStores(this.mapService.getBounds());
      }, updateError => {
        // TODO handle update error
      });
    }, findError => {
      // TODO handle findError
    });
  }

  /*
  Multi-select
   */
  enableMultiSelect(): void {
    this.sideNavIsOpen = false;
    this.selectedDashboardMode = CasingDashboardMode.MULTI_SELECT;
    this.storeMapLayer.clearSelection();
    this.storeMapLayer.selectionMode = StoreSelectionMode.MULTI_SELECT;
    // Activate Map Drawing Tools and listen for completed Shapes
    this.mapService.activateDrawingTools().subscribe(shape => {
      // TODO - Not all stores may be mapped as user draws polygon and pans screen
      if (this.storeMapLayer.selectionMode === StoreSelectionMode.MULTI_SELECT) {
        this.storeMapLayer.selectStoresInShape(shape);
      } else if (this.storeMapLayer.selectionMode === StoreSelectionMode.MULTI_DESELECT) {
        this.storeMapLayer.deselectStoresInShape(shape);
      }
      this.ngZone.run(() => {
        this.mapService.clearDrawings();
      });
    });
  }

  cancelMultiSelect(): void {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    this.storeMapLayer.selectionMode = StoreSelectionMode.SINGLE_SELECT;
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
      this.selectedCardState = CardState.SELECTED_MAPPABLE;
      setTimeout(() => this.storeMapLayer.selectStore(store), 1000);
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
            .subscribe(bounds => this.getGoogleLocationInView(result.query));
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
    this.ngZone.run(() => this.storeMapLayer.updateStore(store));
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
    this.storeMapLayer.getSelectedStores().forEach(store => {
      selectedSiteIds.add(store.site.id);
    });
    const userId = (user != null) ? user.id : null;
    this.siteService.assignToUser(Array.from(selectedSiteIds), userId).subscribe((sites: Site[]) => {
      const message = `Successfully updated ${sites.length} Sites`;
      this.snackBar.open(message, null, {duration: 2000});
      this.getActiveStores(this.mapService.getBounds());
    });
  }
}
