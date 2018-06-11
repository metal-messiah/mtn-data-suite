import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { MapService } from '../../core/services/map.service';
import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/site';
import { CasingDashboardService } from './casing-dashboard.service';
import { MarkerType } from '../../core/functionalEnums/MarkerType';
import { GeocoderService } from '../../core/services/geocoder.service';
import { Mappable } from '../../interfaces/mappable';
import { MapPointLayer } from '../../models/map-point-layer';
import { Color } from '../../core/functionalEnums/Color';
import { MarkerShape } from '../../core/functionalEnums/MarkerShape';
import { IconService } from '../../core/services/icon.service';
import { LabelService } from '../../core/services/label.service';
import { NavigatorService } from '../../core/services/navigator.service';
import { FindMeLayer } from '../../models/find-me-layer';
import { FollowMeLayer } from '../../models/follow-me-layer';
import { LatLngSearchComponent } from '../lat-lng-search/lat-lng-search.component';
import { Coordinates } from '../../models/coordinates';
import { GoogleSearchComponent } from '../google-search/google-search.component';
import { GooglePlace } from '../../models/google-place';
import { Subscription } from 'rxjs/Subscription';
import { StoreService } from '../../core/services/store.service';
import { Store } from '../../models/store';
import { MappableService } from '../../shared/mappable.service';
import { DatabaseSearchComponent } from '../database-search/database-search.component';

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

  movingStore: Store;
  newLocation: Mappable;

  selectedGooglePlace: GooglePlace;

  defaultPointLayer: MapPointLayer;
  newLocationPointLayer: MapPointLayer;
  followMeLayer: FollowMeLayer;
  googleLayer: MapPointLayer;

  // Flags
  showingBoundaries = false;
  sideNavIsOpen = false;

  // Modes
  selectedDashboardMode: CasingDashboardMode = CasingDashboardMode.DEFAULT;
  selectedMultiSelectTool = MultiSelectToolTypes.CLICK;
  selectedMultiSelectMode = MultiSelectMode.SELECT;
  selectedMarkerType = MarkerType.PIN;
  selectedCardState = CardState.HIDDEN;

  // Enums for template
  casingDashboardMode = CasingDashboardMode;
  multiSelectToolType = MultiSelectToolTypes;
  multiSelectMode = MultiSelectMode;
  markerType = MarkerType;
  cardState = CardState;

  googleSearchSubscription: Subscription;

  constructor(public mapService: MapService,
              public geocoderService: GeocoderService,
              public casingDashboardService: CasingDashboardService,
              private siteService: SiteService,
              private storeService: StoreService,
              public mappableService: MappableService,
              private snackBar: MatSnackBar,
              private ngZone: NgZone,
              private router: Router,
              private route: ActivatedRoute,
              private labelService: LabelService,
              private iconService: IconService,
              private navigatorService: NavigatorService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.defaultPointLayer = new MapPointLayer({
      getMappableIsDraggable: (store: Store) => {
        return this.storeIsMoving(store);
      },
      getMappableIcon: (store: Store) => {
        let fillColor = Color.RED;
        if (this.storeIsMoving(store)) {
          fillColor = Color.PURPLE;
        } else if (this.mappableService.mappableIsSelected(store)) {
          fillColor = Color.BLUE;
        }

        let shape: MarkerShape | google.maps.SymbolPath = MarkerShape.FILLED;
        if (this.selectedMarkerType === MarkerType.LABEL) {
          shape = google.maps.SymbolPath.CIRCLE;
        }

        return this.iconService.getIcon(fillColor, Color.WHITE, shape);
      },
      getMappableLabel: (store: Store) => {
        if (this.selectedMarkerType === MarkerType.PIN) {
          return this.labelService.getLabel(store.getLabel()[0], Color.WHITE);
        }
        return this.labelService.getLabel(store.getLabel(), Color.BLACK);
      }
    });
  }

  onMapReady(event) {
    console.log(`Map is ready: ${event}`);
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
    this.defaultPointLayer.markerClick$.subscribe((selectedStore: Store) => {
      if (this.selectedDashboardMode === CasingDashboardMode.MULTI_SELECT) {
        if (this.selectedMultiSelectMode === MultiSelectMode.SELECT) {
          this.mappableService.selectMappable(selectedStore);
        } else {
          this.mappableService.deselectMappable(selectedStore);
        }
        this.defaultPointLayer.refreshOptionsForMappable(selectedStore);
        this.ngZone.run(() => true);
      } else if (this.selectedDashboardMode === CasingDashboardMode.DEFAULT) { // Don't select while moving, creating or following
        const prevSelectedStore = this.mappableService.getLatestSelection();
        this.mappableService.deselectAll();
        this.mappableService.selectMappable(selectedStore);
        if (prevSelectedStore != null) {
          this.defaultPointLayer.refreshOptionsForMappable(prevSelectedStore);
        }
        this.defaultPointLayer.refreshOptionsForMappable(selectedStore);
        this.ngZone.run(() => this.selectedCardState = CardState.SELECTED_MAPPABLE);
      }
    });
  }

  storeIsMoving(store: Store) {
    // If Store is new (has no store_id) or is being moved
    return store.site.id == null ||
      (this.movingStore != null && store.site.id === this.movingStore.site.id);
  }

  getActiveStores(bounds): void {
    console.log('Getting Stores');
    this.storeService.getStoresOfTypeInBounds(bounds).subscribe(
      page => {
        this.mappableService.setMappables(page.content);
        this.defaultPointLayer.clearMarkers();
        this.defaultPointLayer.createMarkersFromMappables(this.mappableService.mappables);
        this.mapService.addPointLayer(this.defaultPointLayer);
        // TODO Show snackbar notfication of number of mappables pulled, filtered, etc.
      }
    );
  }

  toggleSelectedProjectBoundaries(show: boolean): void {
    this.showingBoundaries = show;
    // TODO get boundaries
    // TODO map boundaries
    // TODO fit map to boundaries
  }

  createNewLocation(): void {
    this.sideNavIsOpen = false;
    this.selectedDashboardMode = CasingDashboardMode.CREATING_NEW;
    // Create new Layer for new Location
    this.newLocationPointLayer = new MapPointLayer({
      getMappableIsDraggable: (mappable: Mappable) => {
        return true;
      },
      getMappableIcon: (mappable: Mappable) => {
        return this.iconService.getIcon(Color.PURPLE, Color.WHITE, MarkerShape.DEFAULT);
      },
      getMappableLabel: (mappable: Mappable) => {
        return null;
      }
    });
    // Create new location
    this.newLocation = {
      getCoordinates: () => {
        return this.mapService.getCenter();
      },
      id: 0
    };
    // Add new location to layer
    this.newLocationPointLayer.createMarkerFromMappable(this.newLocation);
    // Add Layer to map
    this.mapService.addPointLayer(this.newLocationPointLayer);
  }

  cancelLocationCreation(): void {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    // Remove layer from map
    this.newLocationPointLayer.removeFromMap();
    // Delete new Location layer
    this.newLocationPointLayer = null;
    // Delete new location
    this.newLocation = null;
  }

  editNewLocation(): void {
    const coordinates = this.newLocationPointLayer.getCoordinatesOfMappableMarker(this.newLocation);
    this.geocoderService.reverseGeocode(coordinates).subscribe((address: Site) => {
      // If reverse geocode is successful - exit creation state (moving on to site page)
      this.cancelLocationCreation();
      // Create a new site from reverse geocode - make sharable via service
      this.casingDashboardService.newSite = new Site(address);
      // Navigate to site detail to edit site before saving to DB
      this.router.navigate(['site-detail'], {relativeTo: this.route});
    }, (err) => console.error(err));
  }

  multiSelect(): void {
    this.sideNavIsOpen = false;
    this.selectedDashboardMode = CasingDashboardMode.MULTI_SELECT;
    // Activate Map Drawing Tools and listen for completed Shapes
    this.mapService.activateDrawingTools().subscribe(shape => {
      // Get Mappaples in drawn shape
      // TODO - Not all mappables may be mapped as user draws polygon and pans screen - need to get these from Web Service
      const mappables = this.defaultPointLayer.getMappablesInShape(shape);

      // Select or deselect mappables
      if (this.selectedMultiSelectMode === MultiSelectMode.SELECT) {
        this.mappableService.selectMappables(mappables);
      } else if (this.selectedMultiSelectMode === MultiSelectMode.DESELECT) {
        this.mappableService.deselectMappables(mappables);
      }
      // Refresh marker Appearance
      this.defaultPointLayer.refreshOptionsForMappables(mappables);
      // Remove drawings from maps
      this.mapService.clearDrawings();
    });
  }

  cancelMultiSelect(): void {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    // Deactivate drawing tools
    this.mapService.deactivateDrawingTools();
    // Clear Selected mappables
    this.mappableService.deselectAll();
    // Refresh marker Appearance
    this.defaultPointLayer.refreshOptions();
  }

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
    this.followMeLayer = new FollowMeLayer();
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
      },
      () => console.log('Completed')
    );
  }

  deactivateFollowMe(): void {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    this.sideNavIsOpen = false;

    this.navigatorService.cancelWatch();
    this.followMeLayer.removeFromMap();
    this.followMeLayer = null;
  }

  pinLocation(): void {
    // TODO create the location data to the device
  }

  goToLocationOverview(): void {
    if (this.mappableService.latestSelected != null) {
      this.router.navigate(['location-overview', this.mappableService.latestSelected.id], {relativeTo: this.route});
    } else {
      throw new Error('Trying to navigate to mappable before it was selected');
    }
  }

  moveStore() {
    this.selectedDashboardMode = CasingDashboardMode.MOVING_MAPPABLE;
    this.movingStore = this.mappableService.latestSelected as Store;
    this.defaultPointLayer.refreshOptionsForMappable(this.movingStore);
  }

  cancelStoreMove() {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    const store = this.movingStore;
    this.movingStore = null;
    this.defaultPointLayer.resetPositionOfMappable(store);
    this.defaultPointLayer.refreshOptionsForMappable(store);
  }

  saveStoreMove() {
    // Get new coordinates
    const coordinates = this.defaultPointLayer.getCoordinatesOfMappableMarker(this.movingStore);

    // Get Full version of site
    this.siteService.getOneById(this.movingStore.site.id).subscribe((site: Site) => {
      // Save updated values
      site.latitude = coordinates.lat;
      site.longitude = coordinates.lng;

      this.siteService.update(site).subscribe(updatedSite => {
        this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
        this.movingStore = null;
        this.getActiveStores(this.mapService.getBounds());
      }, updateError => {
        // TODO handle update error
      });
    }, findError => {
      // TODO handle findError
    });
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

  setMultiSelectMode(mode: MultiSelectMode) {
    this.selectedMultiSelectMode = mode;
  }

  setMarkerType(markerType: MarkerType) {
    this.sideNavIsOpen = false;
    this.selectedMarkerType = markerType;
    this.defaultPointLayer.refreshOptions();
  }

  openDatabaseSearch() {
    const databaseSearchDialog = this.dialog.open(DatabaseSearchComponent);
    databaseSearchDialog.afterClosed().subscribe((store: Store) => {
      this.mappableService.deselectAll();
      this.mappableService.selectMappable(store);
      this.mapService.setCenter(store.getCoordinates());
      this.defaultPointLayer.refreshOptions();
      this.selectedCardState = CardState.SELECTED_MAPPABLE;
    });
  }

  openGoogleSearch() {
    const googleSearchDialog = this.dialog.open(GoogleSearchComponent);
    googleSearchDialog.afterClosed().subscribe(result => {
      if (result != null) {
        // Create google point layer
        if (this.googleLayer == null) {
          this.googleLayer = new MapPointLayer({
            getMappableIsDraggable: (place: GooglePlace) => {
              return false;
            },
            getMappableIcon: (place: GooglePlace) => {
              return this.iconService.getIcon(Color.PINK, Color.WHITE, MarkerShape.FILLED);
            },
            getMappableLabel: (place: GooglePlace) => {
              return place.name;
            }
          });
          this.googleLayer.markerClick$.subscribe((googlePlace: GooglePlace) => {
            console.log(googlePlace);
            this.selectedGooglePlace = googlePlace;
            this.selectedCardState = CardState.GOOGLE;
          });
        }

        if (result.place != null) {
          this.updateGoogleLayer([result.place]);
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
      this.ngZone.run(() => this.updateGoogleLayer(searchResults));
    });
  }

  updateGoogleLayer(mappables: Mappable[]) {
    this.googleLayer.clearMarkers();
    this.googleLayer.createMarkersFromMappables(mappables);
    this.mapService.addPointLayer(this.googleLayer);
  }

  clearGoogleSearch() {
    this.selectedCardState = CardState.HIDDEN;
    if (this.googleSearchSubscription != null) {
      this.googleSearchSubscription.unsubscribe();
      this.googleSearchSubscription = null;
    }
    this.googleLayer.removeFromMap();
    this.googleLayer = null;
  }

  saveGooglePlaceAsStore() {
    this.mapService.getDetailedGooglePlace(this.selectedGooglePlace).subscribe(googlePlace => {
      console.log(googlePlace);
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
}
