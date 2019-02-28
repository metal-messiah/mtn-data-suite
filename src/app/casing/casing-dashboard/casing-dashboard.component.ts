import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { MapService } from '../../core/services/map.service';
import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/full/site';
import { CasingDashboardService } from './casing-dashboard.service';
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
import { DraggableSiteLayer } from '../../models/draggable-site-layer';
import { GooglePlaceLayer } from '../../models/google-place-layer';
import { MapSelectionMode } from '../enums/map-selection-mode';
import { SimplifiedSite } from '../../models/simplified/simplified-site';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { debounce, debounceTime, delay, finalize } from 'rxjs/internal/operators';
import { ProjectService } from '../../core/services/project.service';
import { ProjectBoundaryService } from '../services/project-boundary.service';
import { GeometryUtil } from '../../utils/geometry-util';
import { EntitySelectionService } from '../../core/services/entity-selection.service';
import { DownloadDialogComponent } from '../download-dialog/download-dialog.component';
import { SiteMergeDialogComponent } from '../site-merge-dialog/site-merge-dialog.component';
import { DbEntityMarkerService } from '../../core/services/db-entity-marker.service';
import { InfoCardItem } from '../info-card-item';
import { DbLocationInfoCardComponent } from '../../shared/db-location-info-card/db-location-info-card.component';
import { DbEntityInfoCardItem } from '../db-entity-info-card-item';
import { GoogleInfoCardItem } from '../google-info-card-item';
import { GoogleInfoCardComponent } from '../../shared/google-info-card/google-info-card.component';

export enum CasingDashboardMode {
  DEFAULT, FOLLOWING, MOVING_MAPPABLE, CREATING_NEW, MULTI_SELECT, EDIT_PROJECT_BOUNDARY, DUPLICATE_SELECTION
}

@Component({
  selector: 'mds-casing-dashboard',
  templateUrl: './casing-dashboard.component.html',
  styleUrls: ['./casing-dashboard.component.css'],
  providers: [DbEntityMarkerService]
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
  selecting = false;

  // Modes
  selectedDashboardMode: CasingDashboardMode = CasingDashboardMode.DEFAULT;

  // Enums for template
  casingDashboardMode = CasingDashboardMode;
  storeSelectionMode = MapSelectionMode;

  googleSearchSubscription: Subscription;

  subscriptions: Subscription[] = [];

  // Duplicate Selection
  selectedSiteId: number;

  infoCard: InfoCardItem;
  initiateDuplicateSelection$ = new Subject<number>();
  initiateSiteMove$ = new Subject<Site>();
  siteUpdated$ = new Subject<number>();

  movingSite: Site;

  constructor(public mapService: MapService,
              public dbEntityMarkerService: DbEntityMarkerService,
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
    this.subscriptions.push(this.initiateDuplicateSelection$.subscribe(siteId => {
      // Change the mode (should disables all other user interactions that might conflict)
      this.selectedDashboardMode = CasingDashboardMode.DUPLICATE_SELECTION;

      // Save the first site's ID so you can use it later
      this.selectedSiteId = siteId;

      // Display instructions to user
      const ref = this.snackBar.open(`Select another site to merge with this one`, 'Cancel');

      // If user clicks cancel, close snackbar and return to default mode
      ref.onAction().subscribe(() => this.selectedDashboardMode = CasingDashboardMode.DEFAULT);
    }));
    this.subscriptions.push(this.initiateSiteMove$.subscribe((site: Site) => {
      this.movingSite = site;
      this.selectedDashboardMode = CasingDashboardMode.MOVING_MAPPABLE;
      // Create new site layer
      this.draggableSiteLayer = new DraggableSiteLayer(this.mapService, {lat: site.latitude, lng: site.longitude});
    }));
    this.subscriptions.push(this.siteUpdated$.subscribe(() => this.dbEntityMarkerService.getMarkersInMapView(this.mapService.getMap())));

    this.subscriptions.push(this.mapService.boundsChanged$.pipe(this.getDebounce()).subscribe(() => this.getEntitiesInBounds()));

    this.subscriptions.push(this.dbEntityMarkerService.clickListener$.subscribe(selection => {
      if (this.selectedDashboardMode === CasingDashboardMode.DEFAULT) {
        this.infoCard = new DbEntityInfoCardItem(DbLocationInfoCardComponent, selection,
          this.initiateDuplicateSelection$, this.initiateSiteMove$, this.siteUpdated$);
      } else if (this.selectedDashboardMode === CasingDashboardMode.DUPLICATE_SELECTION) {
        this.onDuplicateSiteSelected(selection.siteId);
      }
    }));

    this.subscriptions.push(this.mapService.mapClick$.subscribe(() => this.infoCard = null));

    this.subscriptions.push(this.casingDashboardService.projectChanged$.subscribe(() => {
      this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
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

  private getDebounce() {
    return debounce(() => of(true)
      .pipe(delay(this.followMeLayer != null ? 10000 : 1000)));
  }

  getEntitiesInBounds(): void {
    if (this.mapService.getZoom() >= this.dbEntityMarkerService.controls.get('minPullZoomLevel').value) {
      this.dbEntityMarkerService.getMarkersInMapView(this.mapService.getMap())
    } else {
      this.snackBar.open('Zoom in or change Pull zoom limit', null, {duration: 3000})
    }
  }

  initSiteCreation(): void {
    this.selectedDashboardMode = CasingDashboardMode.CREATING_NEW;
    // Create new Layer for new Location
    this.draggableSiteLayer = new DraggableSiteLayer(this.mapService, this.mapService.getCenter());
  }

  cancelSiteCreation(): void {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
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
          this.snackBar.open('Successfully created new Site', null, {duration: 1500});
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

  /****************************************
   *  Move Store
   ****************************************/

  /**
   * Called to reset the state if user cancels moving a store
   */
  cancelMove() {
    this.movingSite = null;
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
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
        this.snackBar.open('Successfully created new Site', null, {duration: 1500});
        this.dbEntityMarkerService.getMarkersInMapView(this.mapService.getMap());
      }, err => this.errorService.handleServerError('Failed to update new Site location!', err,
        () => console.log('Cancel'),
        () => this.saveMove()));
  }

  /*
  Multi-select
   */
  enableMultiSelect(): void {
    this.selectedDashboardMode = CasingDashboardMode.MULTI_SELECT;
    this.dbEntityMarkerService.clearSelection(this.mapService.getMap());
    this.dbEntityMarkerService.controls.get('multiSelect').setValue(true);
    // Activate Map Drawing Tools and listen for completed Shapes
    this.mapService.activateDrawingTools().subscribe(shape => {
      const geoJson = GeometryUtil.getGeoJsonFromShape(shape);
      let observable: Observable<{ siteIds: number[], storeIds: number[] }>;
      if (geoJson.geometry.type === 'Point') {
        const longitude = geoJson.geometry.coordinates[0];
        const latitude = geoJson.geometry.coordinates[1];
        const radiusMeters = geoJson.properties.radius;
        // TODO - MDS-468
        observable = this.storeService.getIdsInRadius(latitude, longitude, radiusMeters);
      } else {
        // TODO - MDS-468
        observable = this.storeService.getIdsInShape(JSON.stringify(geoJson));
      }

      this.selecting = true;
      observable.pipe(finalize(() => {
        this.selecting = false;
        this.ngZone.run(() => this.mapService.clearDrawings());
      }))
        .subscribe((ids: { siteIds: number[], storeIds: number[] }) =>
          this.dbEntityMarkerService.multiSelect(ids, this.mapService.getMap()));
    });
  }

  cancelMultiSelect(): void {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    this.mapService.deactivateDrawingTools();
    this.dbEntityMarkerService.clearSelection(this.mapService.getMap());
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
            this.infoCard = new GoogleInfoCardItem(GoogleInfoCardComponent, googlePlace);
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
    if (this.googleSearchSubscription != null) {
      this.googleSearchSubscription.unsubscribe();
      this.googleSearchSubscription = null;
    }
    this.googlePlacesLayer.removeFromMap();
    this.googlePlacesLayer = null;
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
        this.snackBar.open(message, null, {duration: 2000});
        this.getEntitiesInBounds();
      }, err => this.errorService.handleServerError('Failed to update sites!', err,
        () => console.log(err),
        () => this.assign(userId)));
  }

  filterClosed() {
    this.dbEntityMarkerService.refreshMarkers(this.mapService.getMap());
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
    this.projectBoundaryService.showProjectBoundaries().subscribe(() => {
      this.projectBoundaryService.zoomToProjectBoundary();
    });
  }

  selectAllInBoundary() {
    if (this.projectBoundaryService.isShowingBoundary()) {
      const geoJsonString = JSON.stringify(this.projectBoundaryService.projectBoundary.geojson);
      this.selectAllInShape(geoJsonString);
    } else {
      this.projectBoundaryService.showProjectBoundaries().subscribe(boundary => {
        if (boundary != null) {
          this.selectAllInShape(boundary.geojson);
        } else {
          this.snackBar.open('No Boundary for Project', null, {duration: 2000, verticalPosition: 'top'});
        }
      });
      this.projectBoundaryService.zoomToProjectBoundary();
    }
  }

  private selectAllInShape(geoJsonString: string) {
    this.selecting = true;
    // TODO MDS-465
    this.storeService.getIdsInShape(geoJsonString)
      .pipe(finalize(() => this.selecting = false))
      .subscribe((ids: { siteIds: number[], storeIds: number[] }) => {
        this.dbEntityMarkerService.clearSelection(this.mapService.getMap());
        this.dbEntityMarkerService.multiSelect(ids, this.mapService.getMap())
      });
  }

  openDownloadDialog() {
    const config = {data: {selectedStoreIds: this.dbEntityMarkerService.getSelectedStoreIds()}, maxWidth: '90%'};
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
      ref.onAction().subscribe(() => this.selectedDashboardMode = CasingDashboardMode.DEFAULT);
    } else {
      // If the user successfully selects a different site

      // Change the mode back to default (for when they are done)
      this.selectedDashboardMode = CasingDashboardMode.DEFAULT;

      // Dismiss the instructions
      this.snackBar.dismiss();

      // Open the dialog to allow the user to merge the two sites
      const siteMergeDialog = this.dialog.open(SiteMergeDialogComponent, {
        maxWidth: '90%',
        minWidth: '300px',
        disableClose: true,
        data: {duplicateSiteId: duplicateSiteId, selectedSiteId: this.selectedSiteId}
      });

      // When the user completes or cancels merging the sites, refresh the locations on the screen
      siteMergeDialog.afterClosed().subscribe(() => {
        this.dbEntityMarkerService.clearSelection(this.mapService.getMap());
        this.getEntitiesInBounds();
      });
    }
  }
}
