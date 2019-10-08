import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { of, Subject, Subscription } from 'rxjs';
import { debounce, debounceTime, delay, finalize } from 'rxjs/internal/operators';

import { AuthService } from '../../core/services/auth.service';
import { CasingDashboardService } from './casing-dashboard.service';
import { DbEntityMarkerService } from '../../core/services/db-entity-marker.service';
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

import { LatLng } from '../../models/latLng';
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
import { SimplifiedStoreList } from '../../models/simplified/simplified-store-list';
import {
  AddRemoveStoresListDialogComponent,
  AddRemoveType
} from 'app/shared/add-remove-stores-list-dialog/add-remove-stores-list-dialog.component';
import { BoundaryDialogComponent } from 'app/shared/boundary-dialog/boundary-dialog.component';
import { Boundary } from 'app/models/full/boundary';
import { BoundaryService } from 'app/core/services/boundary.service';
import { BoundaryDialogService } from 'app/shared/boundary-dialog/boundary-dialog.service';
import { ProjectBoundary } from 'app/models/project-boundary';
import { UserProfileService } from 'app/core/services/user-profile.service';
import { BannerService } from 'app/core/services/banner.service';
import { CasingDashboardMode } from '../enums/casing-dashboard-mode';
import { EntitySelectionService } from '../../core/services/entity-selection.service';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { CasingProjectService } from '../casing-project.service';
import { ProjectSummaryComponent } from '../project-summary/project-summary.component';
import { StoreSelectionDialogComponent } from '../store-merge/store-selection-dialog/store-selection-dialog.component';
import { StoreAttrSelectionDialogComponent } from '../store-merge/store-attr-selection-dialog/store-attr-selection-dialog.component';
import { UserBoundary } from 'app/models/full/user-boundary';
import { UserBoundaryService } from 'app/core/services/user-boundary.service';
import { GravityService } from '../../core/services/gravity.service';

import * as MarkerWithLabel from '@google/markerwithlabel';

@Component({
  selector: 'mds-casing-dashboard',
  templateUrl: './casing-dashboard.component.html',
  styleUrls: ['./casing-dashboard.component.css'],
  providers: [MapService, DbEntityMarkerService, EntitySelectionService, CasingDashboardService]
})
export class CasingDashboardComponent implements OnInit, OnDestroy {

  // Layers
  draggableSiteLayer: DraggableSiteLayer;
  followMeLayer: FollowMeLayer;
  googlePlacesLayer: GooglePlaceLayer;

  // Flags
  filterSideNavIsOpen = false;
  updating = false;
  savingBoundary = false;

  originalUserBoundary: UserBoundary;
  editingUserBoundary: Boundary = null;
  editingProjectBoundary: ProjectBoundary = null;

  // Enums for template
  casingDashboardMode = CasingDashboardMode;

  googleSearchSubscription: Subscription;

  subscriptions: Subscription[] = [];

  // Duplicate Selection
  selectedSiteId: number;

  infoCard: InfoCardItem;
  initiateDuplicateSelection$ = new Subject<number>();
  initiateSiteMove$ = new Subject<SimplifiedSite>();
  siteUpdated$ = new Subject<number>();

  movingSiteId: number;

  layoutIsSmall = false;

  // Model
  choropleth: google.maps.Data.Feature[];
  web: google.maps.Data.Feature[];
  runningModel = false;
  distanceFactor = 2;
  bannerSisterFactor = 0.0;
  fitSisterFactor = 0.0;
  marketShareThreshold = 0.0;

  constructor(
    private mapService: MapService,
    private casingProjectService: CasingProjectService,
    private dbEntityMarkerService: DbEntityMarkerService,
    private geocoderService: GeocoderService,
    private casingDashboardService: CasingDashboardService,
    private siteService: SiteService,
    private storeService: StoreService,
    private projectService: ProjectService,
    private bannerService: BannerService,
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private navigatorService: NavigatorService,
    private dialog: MatDialog,
    private authService: AuthService,
    private errorService: ErrorService,
    private projectBoundaryService: ProjectBoundaryService,
    private storageService: StorageService,
    private selectionService: EntitySelectionService,
    private breakpointObserver: BreakpointObserver,
    private boundaryDialogService: BoundaryDialogService,
    private boundaryService: BoundaryService,
    private userProfileService: UserProfileService,
    private userBoundaryService: UserBoundaryService,
    private gravityService: GravityService) {
  }

  ngOnInit() {
    // Navigate to correct store-list sidenav view
    this.storageService.getOne('casing-dashboard-store-list-view').subscribe(value => {
      if (value) {
        this.router.navigate(['casing', ...value.split('/')], { skipLocationChange: true });
      }
    });

    // Watch screen size - set flag if small
    this.subscriptions.push(
      this.breakpointObserver
        .observe([Breakpoints.Small, Breakpoints.HandsetPortrait])
        .subscribe((state: BreakpointState) => (this.layoutIsSmall = state.matches))
    );

    this.subscriptions.push(
      this.selectionService.multiSelectChanged$.subscribe(multiSelect => {
        if (multiSelect) {
          this.onMultiSelectEnabled();
        } else {
          this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.DEFAULT;
          this.mapService.deactivateDrawingTools();
        }
      })
    );
  }

  get showStoreLists() {
    return this.casingDashboardService.showingStoreListSidenav;
  }

  setShowStoreLists(showing: boolean) {
    this.casingDashboardService.setShowingStoreListSidenav(showing);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => s.unsubscribe());
    this.dbEntityMarkerService.destroy();
  }

  get controls() {
    return this.dbEntityMarkerService.controls;
  }

  get selectedDashboardMode() {
    return this.casingDashboardService.selectedDashboardMode;
  }

  private onSelection(selection: { storeId: number; siteId: number }) {
    if (this.casingDashboardService.selectedDashboardMode === CasingDashboardMode.DEFAULT) {
      if (this.layoutIsSmall) {
        this.casingDashboardService.setShowingStoreListSidenav(false);
      }
      this.ngZone.run(() => {
        this.infoCard = new DbEntityInfoCardItem(
          DbLocationInfoCardComponent,
          selection,
          this.initiateDuplicateSelection$,
          this.initiateSiteMove$,
          this.siteUpdated$
        );
      });
    } else if (this.casingDashboardService.selectedDashboardMode === CasingDashboardMode.DUPLICATE_SELECTION) {
      this.onDuplicateSiteSelected(selection.siteId);
    }
    this.ngZone.run(() => {});

    // Temp Model code
    const projectId = this.casingProjectService.getSelectedProject().id;
    if (selection.siteId && this.choropleth && this.choropleth.length > 0 && projectId) {
      this.gravityService.getStoreScores(selection.siteId, projectId,
        this.bannerSisterFactor, this.fitSisterFactor, this.marketShareThreshold)
        .subscribe(marketShares => {
          this.mapService.getMap().data.forEach(feature => {
            const fips = feature.getProperty('fips');
            const marketShare = marketShares[fips];
            if (marketShare) {
              feature.setProperty('marketShare', marketShare);
            } else {
              feature.setProperty('marketShare', 0);
            }
          });
        }, err => this.errorService.handleServerError('Failed to get Store Scores!', err, () => console.error(err)));
    } else {
      console.warn('Select a site! Project must also be selected');
    }


  }

  private getBlockGroupColor(marketShare) {
    if (marketShare >= 0.64) {
      return '#FF0000';
    }
    if (marketShare >= 0.32) {
      return '#ff8f02';
    }
    if (marketShare >= 0.16) {
      return '#fef86c';
    }
    if (marketShare >= 0.08) {
      return '#d8ffbe';
    }
    if (marketShare >= 0.04) {
      return '#b8ffec';
    }
    if (marketShare >= 0.02) {
      return '#85e4ff';
    }
    return '#5d9ffe';
  }

  onMapReady() {
    const map = this.mapService.getMap();
    map.data.setStyle(feature => {
      const marketShare = feature.getProperty('marketShare');
      const strokeWeight = feature.getProperty('strokeWeight');
      return {
        fillColor: marketShare ? this.getBlockGroupColor(marketShare) : 'grey',
        strokeWeight: strokeWeight || 0.5
      };
    });

    const marker = new MarkerWithLabel({
      position: map.getCenter(),
      map: map,
      labelClass: 'db-marker-full-label-active',
      icon: ' '
    });
    marker.labelAnchor = new google.maps.Point(marker.labelAnchor.x, 0);

    // map.addListener('mousemove', event => marker.setPosition(event.latLng));

    map.data.addListener('mouseover', event => {
      const marketShare = event.feature.getProperty('marketShare') * 100;

      if (marketShare) {
        if (!marker.getMap()) {
          marker.setMap(map);
        }
        const lat = event.feature.getProperty('lat');
        const lng = event.feature.getProperty('lng');
        const latLng = new google.maps.LatLng(lat, lng);
        // const latLng = event.latLng;
        marker.setPosition(latLng);
        marker.labelContent = marketShare.toFixed(1);
      } else {
        marker.setMap(null);
      }
    });

    map.data.addListener('click', event => {
      if (this.web) {
        this.web.forEach(feature => map.data.remove(feature));
      }

      // Remove any previous web
      const fips = event.feature.getProperty('fips');
      console.log('Clicked: ' + fips);

      // Get and add new web
      const projectId = this.casingProjectService.getSelectedProject().id;
      this.gravityService.getWebForBlockGroup(fips, projectId, this.bannerSisterFactor, this.fitSisterFactor, this.marketShareThreshold)
        .subscribe((webGeoJson: string) => {
          this.web = map.data.addGeoJson(webGeoJson);
          this.web.forEach(bgStore => {
            const marketShare = bgStore.getProperty('marketShare');
            const weight = marketShare * 10;
            bgStore.setProperty('strokeWeight', weight);
            map.data.overrideStyle(bgStore, {strokeColor: 'red'});
          });
        });
    });

    this.mapService.addControl(document.getElementById('refresh'));
    this.mapService.addControl(document.getElementById('info-card-wrapper'), google.maps.ControlPosition.LEFT_BOTTOM);
    this.mapService.addControl(document.getElementById('openListView'), google.maps.ControlPosition.LEFT_BOTTOM);
    this.mapService.addControl(document.getElementById('project-buttons'), google.maps.ControlPosition.TOP_RIGHT);

    this.selectionService.singleSelect$.subscribe(selection => this.onSelection(selection));
    this.dbEntityMarkerService.initMap(
      this.mapService.getMap(),
      this.selectionService,
      this.casingProjectService,
      'casing-dashboard'
    );

    console.log(`Map is ready`);

    this.subscriptions.push(
      this.initiateDuplicateSelection$.subscribe(siteId => {
        // Change the mode (should disables all other user interactions that might conflict)
        this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.DUPLICATE_SELECTION;

        // Save the first site's ID so you can use it later
        this.selectedSiteId = siteId;

        // Display instructions to user
        const ref = this.snackBar.open(`Select another site to merge with this one`, 'Cancel');

        // If user clicks cancel, close snackbar and return to default mode
        ref
          .onAction()
          .subscribe(() => (this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.DEFAULT));
      })
    );

    this.subscriptions.push(
      this.initiateSiteMove$.subscribe((site: SimplifiedSite) => {
        this.movingSiteId = site.id;
        this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.MOVING_MAPPABLE;
        // Create new site layer
        this.draggableSiteLayer = new DraggableSiteLayer(this.mapService, { lat: site.latitude, lng: site.longitude });
      })
    );

    this.subscriptions.push(this.siteUpdated$.subscribe(() => this.getEntitiesInBounds()));

    this.subscriptions.push(
      this.mapService.boundsChanged$.pipe(this.getDebounce()).subscribe(() => {
        if (this.dbEntityMarkerService.controls.updateOnBoundsChange) {
          this.getEntitiesInBounds();
        }
      })
    );

    this.subscriptions.push(this.mapService.mapClick$.subscribe(() => (this.infoCard = null)));

    this.subscriptions.push(
      this.casingProjectService.projectChanged$.subscribe(() => {
        this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.DEFAULT;
        this.projectBoundaryService.hideProjectBoundaries(this.mapService);
        this.getEntitiesInBounds();
      })
    );

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
      const projectId = this.casingProjectService.getSelectedProject().id;
      this.projectBoundaryService.showProjectBoundaries(this.mapService.getMap(), projectId).subscribe();
    }
  }

  private getDebounce() {
    return debounce(() => of(true).pipe(delay(this.followMeLayer != null ? 10000 : 1000)));
  }

  showProjectSummary() {
    this.dialog.open(ProjectSummaryComponent, { data: { project: this.getSelectedProject() } });
  }

  getEntitiesInBounds(): void {
    if (this.mapService.getZoom() >= this.dbEntityMarkerService.controls.minPullZoomLevel) {
      this.dbEntityMarkerService.getMarkersInMapView();
    } else {
      this.snackBar.open('Zoom in or change Pull zoom limit', null, { duration: 2000, verticalPosition: 'top' });
    }
  }

  initSiteCreation(): void {
    this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.CREATING_NEW;
    // Create new Layer for new Location
    this.draggableSiteLayer = new DraggableSiteLayer(this.mapService, this.mapService.getCenter());
  }

  cancelSiteCreation(): void {
    this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    // Remove layer from map
    this.draggableSiteLayer.removeFromMap();
    // Delete new Location layer
    this.draggableSiteLayer = null;
  }

  editNewLocation(): void {
    const coordinates = this.draggableSiteLayer.getCoordinatesOfDraggableMarker();
    this.ngZone.run(() => {
      const snackBarRef = this.snackBar.open('Reverse Geocoding...', null);
      this.geocoderService
        .reverseGeocode(coordinates)
        .pipe(finalize(() => snackBarRef.dismiss()))
        .subscribe(
          (newSite: Site) => {
            // If reverse geocode is successful - exit creation state (moving on to site page)
            newSite.latitude = coordinates.lat;
            newSite.longitude = coordinates.lng;
            newSite.type = 'ANCHOR';
            this.createNewSite(new Site(newSite));
          },
          err => {
            this.cancelSiteCreation();
            console.error(err);
          }
        );
    });
  }

  private createNewSite(site: Site) {
    this.ngZone.run(() => {
      // Create a new site from reverse geocode - make sharable via service
      const snackBarRef2 = this.snackBar.open('Creating new site...', null);
      this.siteService
        .create(site)
        .pipe(finalize(() => this.cancelSiteCreation()))
        .subscribe(() => {
          this.snackBar.open('Successfully created new Site', null, {duration: 1500});
          this.getEntitiesInBounds();
        }, err => {
          snackBarRef2.dismiss();
          this.cancelSiteCreation();
          this.errorService.handleServerError('Failed to create new Site!', err,
            () => console.error(err),
            () => this.createNewSite(site));
        });
    });
  }

  /**
   * Geo-location
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
    this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.FOLLOWING;
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
    this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.DEFAULT;

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
    this.movingSiteId = null;
    this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    // Remove layer from map
    this.draggableSiteLayer.removeFromMap();
    // Delete new Location layer
    this.draggableSiteLayer = null;
  }

  /**
   * After user moves pin and clicks save, siteService is used to update the coordinates
   */
  saveMove() {
    this.siteService.getOneById(this.movingSiteId).subscribe(site => {
      const coordinates = this.draggableSiteLayer.getCoordinatesOfDraggableMarker();
      site.latitude = coordinates.lat;
      site.longitude = coordinates.lng;
      // Get new coordinates
      this.siteService.update(site)
        .pipe(finalize(() => {
          this.movingSiteId = null;
          this.draggableSiteLayer.removeFromMap();
        }))
        .subscribe(() => {
          this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.DEFAULT;
          this.snackBar.open('Successfully created new Site', null, {duration: 1500});
          this.getEntitiesInBounds();
        }, err => this.errorService.handleServerError('Failed to update new Site location!', err,
          () => console.log('Cancel'),
          () => this.saveMove()));
    });
  }

  /****************
   * Multi-select
   ****************/
  // Selection Service now handles the flags and will emit an event which triggers UI changes in this and other components
  enableMultiSelect(): void {
    this.selectionService.setMultiSelect(true);
  }

  // Called when selection service emits selection event
  private onMultiSelectEnabled() {
    this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.MULTI_SELECT;
    // Activate Map Drawing Tools and listen for completed Shapes
    this.mapService.activateDrawingTools().subscribe(shape => {
      const geoJson = GeometryUtil.getGeoJsonFromShape(shape);
      if (geoJson.geometry.type === 'Point') {
        const longitude = geoJson.geometry.coordinates[0];
        const latitude = geoJson.geometry.coordinates[1];
        const radiusMeters = geoJson.properties.radius;
        this.dbEntityMarkerService.getAllIncludedWithinRadius(latitude, longitude, radiusMeters)
          .subscribe(ids => this.selectionService.selectByIds(ids));
      } else {
        this.dbEntityMarkerService.getAllIncludedWithinGeoJson(JSON.stringify(geoJson))
          .subscribe(ids => this.selectionService.selectByIds(ids));
      }
      this.mapService.clearDrawings();
    });
  }

  getSelectionCount() {
    return this.selectionService.storeIds.size;
  }

  clearSelection() {
    this.selectionService.clearSelection();
  }

  cancelMultiSelect(): void {
    this.selectionService.setMultiSelect(false);
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
    const googleSearchDialog = this.dialog.open(GoogleSearchComponent, { data: { mapService: this.mapService } });
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
          this.googleSearchSubscription = this.mapService.boundsChanged$.pipe(debounceTime(750)).subscribe(() => {
            this.getGoogleLocationsInView(result.query, this.mapService.getBounds());
          });
        }
      }
    });
  }

  getGoogleLocationsInView(query: string, bounds?: any) {
    this.mapService.searchFor(query, bounds).subscribe(
      (searchResults: GooglePlace[]) => {
        if (searchResults.length) {
          this.ngZone.run(() => {
            this.googlePlacesLayer.setGooglePlaces(searchResults);
          });
        } else {
          this.warnNoResults(query);
        }
      },
      err => {
        if (err === 'ZERO_RESULTS') {
          this.warnNoResults(query);
        }
      }
    );
  }

  private warnNoResults(query: string) {
    const message = `No Google results found for '${query}'`;
    this.ngZone.run(() => this.snackBar.open(message, null, { duration: 2000 }));
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
    latLngSearchDialog.afterClosed().subscribe((coordinates: LatLng) => {
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

  /***************
   * Assigning
   ***************/
  openAssignmentDialog() {
    this.dialog.open(UserProfileSelectComponent)
      .afterClosed()
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
    this.assign(user != null ? user.id : null);
  }

  private assign(userId: number) {
    this.updating = true;
    this.storeService
      .assignToUser(Array.from(this.selectionService.storeIds), userId)
      .pipe(finalize(() => (this.updating = false)))
      .subscribe(
        (sites: SimplifiedSite[]) => {
          const message = `Successfully updated ${sites.length} Sites`;
          this.snackBar.open(message, null, { duration: 2000 });
          this.getEntitiesInBounds();
        },
        err =>
          this.errorService.handleServerError(
            'Failed to update sites!',
            err,
            () => console.log(err),
            () => this.assign(userId)
          )
      );
  }

  isShowingBoundary() {
    return this.projectBoundaryService.isShowingBoundary();
  }

  hideProjectBoundaries() {
    return this.projectBoundaryService.hideProjectBoundaries(this.mapService);
  }

  async saveBoundary() {
    if (!this.editingProjectBoundary) {
      this.savingBoundary = true;
      const project = this.casingProjectService.getSelectedProject();
      const projectId = project.id;
      const geojson = this.projectBoundaryService.projectBoundary.toGeoJson();

      let boundary = this.projectBoundaryService.boundary;
      if (boundary && boundary.id) {
        boundary = await this.boundaryService.getOneById(boundary.id).toPromise();
        boundary.geojson = geojson;
      } else {
        boundary = new Boundary({ geojson: geojson });
      }
      const serverMethod = boundary.id ? 'update' : 'create';
      this.boundaryService[serverMethod](boundary)
        .pipe(finalize(() => (this.savingBoundary = false)))
        .subscribe(
          (b: Boundary) => {
            this.projectBoundaryService.deactivateEditingMode(this.mapService);
            this.projectBoundaryService.projectBoundary.setGeoJson(JSON.parse(geojson));
            if (serverMethod === 'create') {
              this.projectService.associateBoundaryToProject(projectId, b.id).subscribe(p => {
                this.casingProjectService.setSelectedProject(p);
                this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.DEFAULT;
                this.cancelBoundaryEditing();
              });
            } else {
              this.casingProjectService.setSelectedProject(project);
              this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.DEFAULT;
              this.cancelBoundaryEditing();
            }
          },
          err =>
            this.errorService.handleServerError(
              'Failed to save project boundary!',
              err,
              () => console.log(err),
              () => this.saveBoundary()
            )
        );
    } else {
      this.savingBoundary = true;
      this.editingUserBoundary.geojson = this.editingProjectBoundary.toGeoJson();
      const serverMethod = this.editingUserBoundary.id ? 'update' : 'create';
      this.boundaryService[serverMethod](this.editingUserBoundary)
        .pipe(finalize(() => (this.savingBoundary = false)))
        .subscribe((b: Boundary) => {
          this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.DEFAULT;
          if (serverMethod === 'create') {
            this.originalUserBoundary.boundary = b;
            this.originalUserBoundary.user = this.authService.sessionUser;
            this.userBoundaryService.create(this.originalUserBoundary).subscribe(() => {
              this.cancelBoundaryEditing();
              this.openBoundariesDialog();
            });
          } else {
            this.cancelBoundaryEditing();
            this.openBoundariesDialog();
          }
        },
    err => this.errorService.handleServerError('Failed to save project boundary!', err,
      () => console.log(err),
      () => this.saveBoundary()));
    }
  }

  cancelBoundaryEditing() {
    this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    if (!this.editingUserBoundary && !this.editingProjectBoundary) {
      this.projectBoundaryService.cancelProjectBoundaryEditing(this.mapService);
    } else {
      this.boundaryDialogService.cancelBoundaryEditing(this.editingProjectBoundary);
      this.editingProjectBoundary.removeFromMap();
      this.editingUserBoundary = null;
      this.editingProjectBoundary = null;
      this.originalUserBoundary = null;
      this.mapService.deactivateDrawingTools();
    }
  }

  setDrawingModeToClick() {
    this.mapService.setDrawingModeToClick();
  }

  setDrawingModeToRectangle() {
    this.mapService.setDrawingModeToRectangle();
  }

  setDrawingModeToCircle() {
    this.mapService.setDrawingModeToCircle();
  }

  setDrawingModeToPolygon() {
    this.mapService.setDrawingModeToPolygon();
  }

  enableShapeDeletion() {
    this.mapService.setDrawingModeToClick();
    if (!this.editingUserBoundary) {
      this.projectBoundaryService.enableProjectShapeDeletion();
    } else {
      this.boundaryDialogService.enableShapeDeletion(this.editingProjectBoundary);
    }
  }

  disableShapeDeletion() {
    if (!this.editingUserBoundary) {
      this.projectBoundaryService.disableProjectShapeDeletion();
    } else {
      this.boundaryDialogService.disableShapeDeletion(this.editingProjectBoundary);
    }
  }

  enableBoundaryEditing() {
    this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.EDIT_PROJECT_BOUNDARY;

    this.mapService.setDrawingModeToClick();
    if (!this.editingProjectBoundary) {
      if (!this.projectBoundaryService.projectBoundary) {
        const projectId = this.casingProjectService.getSelectedProject().id;
        this.projectBoundaryService
          .showProjectBoundaries(this.mapService.getMap(), projectId)
          .subscribe(() => this.setUpProjectEditing());
      } else {
        this.setUpProjectEditing();
      }
      this.projectBoundaryService.zoomToProjectBoundary();
    } else {
      if (!this.editingUserBoundary.id) {
        this.mapService.setDrawingModeToPolygon();
      }
      if (!this.editingProjectBoundary.isEditable()) {
        this.mapService.activateDrawingTools().subscribe(shape => this.editingProjectBoundary.addShape(shape));
        this.editingProjectBoundary.setEditable(true);
      }
      this.boundaryDialogService.zoomToBoundary(this.editingProjectBoundary);
    }
  }

  private setUpProjectEditing() {
    const boundary = this.projectBoundaryService.projectBoundary;
    if (!boundary.isEditable()) {
      this.mapService.activateDrawingTools().subscribe(shape => boundary.addShape(shape));
      boundary.setEditable(true);
    }
  }

  clearBlockGroups() {
    const data = this.mapService.getMap().data;
    data.forEach(feature => data.remove(feature));
  }

  showBlockGroups() {
    const data = this.mapService.getMap().data;

    this.clearBlockGroups();
    // Clear previous
    const projectId = this.casingProjectService.getSelectedProject().id;

    this.dbEntityMarkerService.gettingLocations = true;
    this.gravityService.getProjectBlockGroupGeoJson(projectId).subscribe(geoJson => {
      this.choropleth = data.addGeoJson(geoJson);
    });
  }

  showBoundary() {
    const projectId = this.casingProjectService.getSelectedProject().id;
    this.projectBoundaryService
      .showProjectBoundaries(this.mapService.getMap(), projectId)
      .subscribe(() => this.projectBoundaryService.zoomToProjectBoundary());
  }

  selectAllInBoundary() {
    this.selectionService.clearSelection();
    if (this.projectBoundaryService.isShowingBoundary()) {
      const geoJsonString = JSON.stringify(this.projectBoundaryService.projectBoundary.geojson);
      this.dbEntityMarkerService
        .getAllIncludedWithinGeoJson(geoJsonString)
        .subscribe(ids => this.selectionService.selectByIds(ids));
    } else {
      const projectId = this.casingProjectService.getSelectedProject().id;
      this.projectBoundaryService.showProjectBoundaries(this.mapService.getMap(), projectId).subscribe(boundary => {
        if (boundary != null) {
          this.dbEntityMarkerService
            .getAllIncludedWithinGeoJson(boundary.geojson)
            .subscribe(ids => this.selectionService.selectByIds(ids));
          this.projectBoundaryService.zoomToProjectBoundary();
        } else {
          this.snackBar.open('No Boundary for Project', null, { duration: 2000, verticalPosition: 'top' });
        }
      });
    }
  }

  getSelectedProject() {
    return this.casingProjectService.getSelectedProject();
  }

  openProjectSelectionDialog() {
    return this.casingProjectService.openProjectSelectionDialog();
  }

  openDownloadDialog() {
    const config = {
      data: { selectedStoreIds: Array.from(this.selectionService.storeIds) },
      maxWidth: '90%'
    };
    const downloadDialog = this.dialog.open(DownloadDialogComponent, config);
    downloadDialog.afterClosed().subscribe(project => {
      if (project) {
        downloadDialog.close();
      }
    });
  }

  userIsGuest() {
    const role = this.authService.sessionUser.role;
    return role && role.displayName === 'Guest Analyst';
  }

  onDuplicateSiteSelected(duplicateSiteId: number) {
    // If the user selects the same site (can't merge with self)
    if (this.selectedSiteId === duplicateSiteId) {
      // Display clarifying instructions to user
      const message = 'Oops, select ANY OTHER site to merge into this site';
      const ref = this.snackBar.open(message, 'Cancel');

      // If user clicks cancel, close snackbar and return to default mode
      ref.onAction().subscribe(() => (this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.DEFAULT));
    } else {
      // If the user successfully selects a different site

      // Change the mode back to default (for when they are done)
      this.casingDashboardService.selectedDashboardMode = CasingDashboardMode.DEFAULT;

      // Dismiss the instructions
      this.snackBar.dismiss();

      // Open the dialog to allow the user to merge the two sites
      const siteMergeDialog = this.dialog.open(SiteMergeDialogComponent, {
        maxWidth: '90%',
        minWidth: '300px',
        disableClose: true,
        data: {
          duplicateSiteId: duplicateSiteId,
          selectedSiteId: this.selectedSiteId
        }
      });

      // When the user completes or cancels merging the sites, refresh the locations on the screen
      siteMergeDialog.afterClosed().subscribe(() => {
        this.dbEntityMarkerService.removeMarkerForSite(duplicateSiteId);
        this.selectionService.clearSelection();
        this.getEntitiesInBounds();

        this.siteService.getOneById(this.selectedSiteId).subscribe(site => {
          if (site.stores.length > 1) {
            this.dialog
              .open(StoreSelectionDialogComponent, {
                data: { stores: site.stores },
                disableClose: true,
                maxWidth: '90%',
                minWidth: '300px'
              })
              .afterClosed()
              .subscribe((stores: Store[]) => {
                if (stores && stores.length > 1) {
                  // Open the attribute selection dialog
                  this.dialog
                    .open(StoreAttrSelectionDialogComponent, {
                      data: { selectedStores: stores },
                      maxWidth: '90%',
                      minWidth: '300px'
                    })
                    .afterClosed()
                    .subscribe((store: Store) => {
                      if (store) {
                        this.getEntitiesInBounds();
                      }
                    });
                }
              });
          }
        });
      });
    }
  }

  get selectedStoreIds() {
    return this.selectionService.storeIds;
  }

  addToList() {
    if (this.selectionService.storeIds.size > 0) {
      const data = { type: AddRemoveType.ADD, storeIds: Array.from(this.selectionService.storeIds) };
      this.dialog.open(AddRemoveStoresListDialogComponent, { data: data, disableClose: true });
    }
  }

  drawingModeIs(drawingMode: string) {
    return this.mapService.drawingModeIs(drawingMode);
  }

  get deletingProjectShapes() {
    return this.projectBoundaryService.deletingProjectShapes;
  }

  set deselecting(tf: boolean) {
    this.selectionService.deselecting = tf;
  }

  get deselecting() {
    return this.selectionService.deselecting;
  }

  get gettingLocations() {
    return this.dbEntityMarkerService.gettingLocations;
  }

  removeFromList() {
    if (this.selectionService.storeIds.size > 0) {
      const data = { type: AddRemoveType.REMOVE, storeIds: Array.from(this.selectionService.storeIds) };
      this.dialog.open(AddRemoveStoresListDialogComponent, { data: data, disableClose: true });
    }
  }

  openSidenavDirectlyToSelectedListStores(storeList: SimplifiedStoreList) {
    this.casingDashboardService.setShowingStoreListSidenav(true);
    if (this.layoutIsSmall) {
      this.filterSideNavIsOpen = false;
    }
    this.router.navigate(['casing', 'list-stores', storeList.id], { skipLocationChange: true })
      .then(() => this.ngZone.run(() => {}));
  }

  openBoundariesDialog() {
    this.dialog
      .open(BoundaryDialogComponent, {
        disableClose: true,
        data: {
          map: this.mapService
        }
      })
      .afterClosed()
      .subscribe((editTarget: UserBoundary) => {
        this.originalUserBoundary = editTarget;
        if (editTarget) {
          if (editTarget.boundaryId) {
            this.boundaryService.getOneById(editTarget.boundaryId).subscribe((boundary: Boundary) => {
              this.editingUserBoundary = boundary;
              this.editingProjectBoundary = this.boundaryDialogService.convertBoundaryToProjectBoundary(boundary);
              this.enableBoundaryEditing();
            });
          } else {
            const boundary = new Boundary(editTarget);
            this.editingUserBoundary = boundary;
            this.editingProjectBoundary = this.boundaryDialogService.convertBoundaryToProjectBoundary(boundary);
            this.enableBoundaryEditing();
          }
        }
      });
  }
}
