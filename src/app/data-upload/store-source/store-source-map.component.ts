// UTILITIES //
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { debounceTime, finalize, tap } from 'rxjs/internal/operators';
// SERVICES //
import { StoreSourceService } from '../../core/services/store-source.service';
import { MapService } from '../../core/services/map.service';
import { ErrorService } from '../../core/services/error.service';
import { AuthService } from '../../core/services/auth.service';
import { SourceUpdatableService } from 'app/core/services/source-updatable.service';
// MODELS //
import { Pageable } from '../../models/pageable';
import { SourceUpdatable } from '../../models/source-updatable';
import { StoreSourceLayer } from 'app/models/store-source-layer';
import { SimplifiedStoreSource } from '../../models/simplified/simplified-store-source';
import { DbEntityMarkerService } from '../../core/services/db-entity-marker.service';
import { BannerSourceService } from '../../core/services/banner-source.service';
import { StoreSource } from '../../models/full/store-source';
import { Location } from '@angular/common';
import { of, Subscription } from 'rxjs';
import { StoreSourceDataFormComponent } from './store-source-data-form/store-source-data-form.component';
import { EntitySelectionService } from '../../core/services/entity-selection.service';
import { CasingProjectService } from '../../casing/casing-project.service';
import { DbEntityMarkerControls } from '../../models/db-entity-marker-controls';
import { SiteMarker } from '../../models/site-marker';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

export enum PageEvent {
  PREV,
  NEXT
}

@Component({
  selector: 'mds-store-source-map',
  templateUrl: './store-source-map.component.html',
  styleUrls: ['./store-source-map.component.css'],
  providers: [DbEntityMarkerService, MapService]
})
export class StoreSourceMapComponent implements OnInit, OnDestroy {

  private _nextStoreSource: StoreSource;

  // Route Query Params
  queryParams: ParamMap;

  // Mapping
  storeSourceLayer: StoreSourceLayer;

  // For Matching Component
  currentStoreSource: StoreSource;
  siteMarkers: SiteMarker[];

  // StoreSources
  storeSourceList: SimplifiedStoreSource[] = [];
  currentRecordIndex = 0;
  totalStoreSourceRecords = 0;

  // Flags
  retrievingSources = false;
  updatingStoreSource = false;

  gettingStoreSource = false;

  gettingSourceUpdatable = false;

  controlSideNavIsOpen = false;
  onlyShowNonValidated = true;

  // Pagination Management Stuff
  page: Pageable<SimplifiedStoreSource> = {
    content: [],
    last: false,
    totalElements: -1,
    totalPages: -1,
    size: -1,
    number: -1,
    sort: '',
    first: true,
    numberOfElements: -1
  };
  validatedPages: any = {};
  recordsPerPage = 50;
  sizeOptions = [10, 50, 100, 250, 500];

  infoWindow: google.maps.InfoWindow;

  subscriptions: Subscription[] = [];

  layoutIsSmall = false;

  constructor(
    private storeSourceService: StoreSourceService,
    private bannerSourceService: BannerSourceService,
    private mapService: MapService,
    private ngZone: NgZone,
    private errorService: ErrorService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dbEntityMarkerService: DbEntityMarkerService,
    private route: ActivatedRoute,
    private router: Router,
    private _location: Location,
    private sourceUpdatableService: SourceUpdatableService,
    private selectionService: EntitySelectionService,
    private casingProjectService: CasingProjectService,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.queryParams = this.route.snapshot.queryParamMap;
    this.initListeners();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.dbEntityMarkerService.destroy();
  }

  onMapReady() {
    this.mapService.addControl(document.getElementById('controlsButton'));
    this.infoWindow = new google.maps.InfoWindow({content: document.getElementById('infoWindow')});

    // Change controls specifically for source matching
    const controls = new DbEntityMarkerControls({
      showActive: true,
      showHistorical: true,
      showFuture: true,
      showVacantSites: true,
      showSitesBackfilledByNonGrocery: true,
      showFloat: true,
      cluster: false,
      clusterZoomLevel: 13,
      minPullZoomLevel: 10,
      fullLabelMinZoomLevel: 10,
      markerType: 'Pin',
      updateOnBoundsChange: true,
      storeList: null,
      showClosed: true,
      showDeadDeal: true,
      showNewUnderConstruction: true,
      showOpen: true,
      showPlanned: true,
      showProposed: true,
      showRemodel: true,
      showRumored: true,
      showStrongRumor: true,
      showTemporarilyClosed: true,
      banners: [],
      assignment: null
    });
    this.dbEntityMarkerService.initMap(this.mapService.getMap(), this.selectionService, this.casingProjectService,
      'store-source', controls);

    this.storeSourceLayer = new StoreSourceLayer(this.mapService);

    const boundsChangedListener = this.mapService.boundsChanged$.pipe(debounceTime(1000))
      .subscribe(() => this.onBoundsChanged());

    this.subscriptions.push(boundsChangedListener);

    this.getStoreSources();
  }

  get controls() {
    return this.dbEntityMarkerService.controls;
  }

  openSidenavDirectlyToSelectedListStores(event) {
    this.snackBar.open('Not supported in this module!', null, {duration: 2000});
  }

  filterChanged() {
    this.getStoreSources();
  }

  decidePage(button: PageEvent): string {
    if (button === PageEvent.NEXT) {
      return `${this.page.number + 1}`;
    }
    if (button === PageEvent.PREV) {
      return `${this.page.number - 1}`;
    }

    if (!this.storeSourceList.length) {
      // there are no records!
      return '0';
    } else {
      // there are already records
      const firstUnvalidatedIdx = this.storeSourceList.findIndex((r) => !r.validatedDate);
      if (firstUnvalidatedIdx === -1) {
        // there are no unvalidated records on the current page of records!

        this.validatedPages[this.page.number] = true;

        if (!this.page.last) {
          return `${this.page.number + 1}`;
        } else {
          return '0';
        }
      } else {
        // there are still unvalidated records to look at here
        return `${this.page.number}`;
      }
    }
  }

  getStoreSources(button?: PageEvent) {
    const pageNumber = this.decidePage(button);

    const validated = this.onlyShowNonValidated ? false : null;

    this.retrievingSources = true;
    this.storeSourceService.getStoreSources(validated, pageNumber, `${this.recordsPerPage}`, this.queryParams)
      .pipe(finalize(() => (this.retrievingSources = false)))
      .subscribe((page: Pageable<SimplifiedStoreSource>) => {
        this.page = page;
        this.totalStoreSourceRecords = page.totalElements;
        this.storeSourceList = page.content;

        if (this.storeSourceList.length > 0) {
          const firstUnvalidatedIdx = this.storeSourceList.findIndex((r) => !r.validatedDate);
          const selectedStoreSource = this.storeSourceList[(firstUnvalidatedIdx >= 0) ? firstUnvalidatedIdx : 0];

          this.setCurrentRecord(firstUnvalidatedIdx >= 0 ? firstUnvalidatedIdx : 0, selectedStoreSource.id);
        }
      });
  }

  prevPage() {
    this.getStoreSources(PageEvent.PREV);
  }

  nextPage() {
    this.getStoreSources(PageEvent.NEXT);
  }

  goToLocationMatcher() {
    this.storeSourceLayer.setDraggable(false);
  }

  createNewSite() {
    const sourceUpdatable = new SourceUpdatable();
    sourceUpdatable.storeName = this.currentStoreSource.sourceStoreName;
    const sd = this.currentStoreSource.storeSourceData;
    if (sd) {
      sourceUpdatable.address = sd.address;
      sourceUpdatable.city = sd.city;
      sourceUpdatable.county = sd.county;
      sourceUpdatable.state = sd.state;
      sourceUpdatable.postalCode = sd.postalCode;
      sourceUpdatable.shoppingCenterName = sd.shoppingCenterName;
    }

    if (sd && sd.latitude && sd.longitude) {
      sourceUpdatable.latitude = sd.latitude;
      sourceUpdatable.longitude = sd.longitude;
    } else {
      const mapCenter = this.mapService.getCenter();
      sourceUpdatable.latitude = mapCenter.lat;
      sourceUpdatable.longitude = mapCenter.lng;
    }
    this.advance(sourceUpdatable);
  }

  createNewSiteForShoppingCenter(scId: number) {
    this.gettingSourceUpdatable = true;
    this.sourceUpdatableService.getUpdatableByShoppingCenterId(scId)
      .pipe(finalize(() => (this.gettingSourceUpdatable = false)))
      .subscribe(sourceUpdatable => {
        const sd = this.currentStoreSource.storeSourceData;
        if (sd && sd.latitude && sd.longitude) {
          sourceUpdatable.latitude = sd.latitude;
          sourceUpdatable.longitude = sd.longitude;
        } else {
          const mapCenter = this.mapService.getCenter();
          sourceUpdatable.latitude = mapCenter.lat;
          sourceUpdatable.longitude = mapCenter.lng;
        }
        sourceUpdatable.storeName = this.currentStoreSource.sourceStoreName;
        this.advance(sourceUpdatable);
      });
  }

  createNewStoreForSite(siteId: number) {
    this.gettingSourceUpdatable = true;
    this.sourceUpdatableService.getUpdatableBySiteId(siteId)
      .pipe(finalize(() => (this.gettingSourceUpdatable = false)))
      .subscribe(sourceUpdatable => {
        sourceUpdatable.storeName = this.currentStoreSource.sourceStoreName;
        this.advance(sourceUpdatable);
      });
  }

  matchStore(storeId: number) {
    this.gettingSourceUpdatable = true;
    this.sourceUpdatableService.getUpdatableByStoreId(storeId)
      .pipe(finalize(() => (this.gettingSourceUpdatable = false)))
      .subscribe(sourceUpdatable => this.advance(sourceUpdatable));
  }

  setCurrentRecord(index: number, storeSourceId: number, event?) {
    this.currentRecordIndex = index;

    // If the user didn't click on it
    if (!event) {
      const elem = document.getElementById(`${index}`);
      if (elem) {
        elem.scrollIntoView({behavior: 'smooth'});
      }
    }
    this.getStoreSource(storeSourceId).subscribe((storeSource: StoreSource) => {
      const sd = storeSource.storeSourceData;
      if (sd) {
        const coords = {lat: sd.latitude, lng: sd.longitude};
        this.mapService.setCenter(coords);
        this.mapService.setZoom(15);
        this.storeSourceLayer.setPin(coords, false);
        this.goToLocationMatcher();
      } else {
        this.snackBar.open('Store Source does\'t have a latitude and longitude!', null, {duration: 3000});
      }

      if (this.storeSourceList.length > index + 1) {
        const nextStoreSource = this.storeSourceList[index + 1];
        this.fetchNextStoreSource(nextStoreSource.id);
      }
    });
  }

  fetchNextStoreSource(storeSourceId: number) {
    return this.storeSourceService.getOneById(storeSourceId)
      .subscribe(storeSource => this._nextStoreSource = storeSource);
  }

  private getStoreSource(storeSourceId: number) {
    // Retrieve Pre-fetched source
    if (this._nextStoreSource && this._nextStoreSource.id === storeSourceId) {
      this.currentStoreSource = this._nextStoreSource;
      this.siteMarkers = null;
      return of(this._nextStoreSource);
    }

    this.gettingStoreSource = true;
    return this.storeSourceService.getOneById(storeSourceId)
      .pipe(finalize(() => (this.gettingStoreSource = false)))
      .pipe(tap((storeSource: StoreSource) => {
        this.currentStoreSource = storeSource;
        this.siteMarkers = null;
      }));
  }

  private initListeners() {
    const matchStoreFromMap = this.selectionService.singleSelect$.subscribe(selection => {
      if (selection.storeId) {
        this.matchStore(selection.storeId);
      } else if (selection.siteId) {
        this.createNewStoreForSite(selection.siteId);
      }
    });
    const markersChanged = this.dbEntityMarkerService.visibleMarkersChanged$.subscribe(() => {
      this.siteMarkers = this.dbEntityMarkerService.getVisibleSiteMarkers();
    });
    this.subscriptions.push(matchStoreFromMap);
    this.subscriptions.push(markersChanged);
    // Watch screen size - set flag if small
    this.subscriptions.push(this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.HandsetPortrait])
      .subscribe((state: BreakpointState) => this.layoutIsSmall = state.matches));
  }

  private setSourceStoreAndValidate(storeId: number) {
    this.updatingStoreSource = true;
    // Then set the store for the storeSource
    this.storeSourceService.setStore(this.currentStoreSource.id, storeId, true)
      .pipe(finalize(() => (this.updatingStoreSource = false)))
      .subscribe(() => {
        this.getStoreSources();
        this.snackBar.open(`Successfully updated record`, 'View', {duration: 4000})
          .onAction().subscribe(() => window.open(location.origin + '/casing?store-id=' + storeId, '_blank'));
      }, (err) => this.errorService.handleServerError(`Failed to update storeSource!`, err, () => console.log(err)));
  }

  private advance(sourceUpdatable: SourceUpdatable) {
    const config = {
      data: {
        sourceUpdatable: sourceUpdatable,
        storeSource: this.currentStoreSource
      },
      disableClose: true
    };
    this.dialog.open(StoreSourceDataFormComponent, config)
      .afterClosed()
      .subscribe(result => {
        if (result && result.storeId) {
          this.setSourceStoreAndValidate(result.storeId);
        }
      });
  }

  private onBoundsChanged() {
    if (this.currentStoreSource && this.mapService.getMap()) {
      if (this.mapService.getZoom() >= this.dbEntityMarkerService.controls.minPullZoomLevel) {
        this.siteMarkers = null;
        this.dbEntityMarkerService.getMarkersInMapView();
      } else {
        this.snackBar.open('Zoom in or change Pull zoom limit', null, {duration: 3000});
      }
    }
  }

}
