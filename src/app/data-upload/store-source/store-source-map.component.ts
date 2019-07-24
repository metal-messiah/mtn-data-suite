// UTILITIES //
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { debounceTime, finalize } from 'rxjs/internal/operators';
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
import { SourceLocationMatchingService } from './source-location-matching.service';
import { Subscription } from 'rxjs';
import { StoreSourceDataFormComponent } from './store-source-data-form/store-source-data-form.component';
import { EntitySelectionService } from '../../core/services/entity-selection.service';
import { CasingProjectService } from '../../casing/casing-project.service';

export enum PageEvent {
  PREV,
  NEXT
}

@Component({
  selector: 'mds-store-source-map',
  templateUrl: './store-source-map.component.html',
  styleUrls: ['./store-source-map.component.css'],
  providers: [DbEntityMarkerService, SourceLocationMatchingService, MapService]
})
export class StoreSourceMapComponent implements OnInit, OnDestroy {
  // Route Query Params
  queryParams: ParamMap;

  // Mapping
  storeSourceLayer: StoreSourceLayer;

  // StoreSource
  storeSourceList: SimplifiedStoreSource[] = [];
  currentRecordIndex = 0;
  totalStoreSourceRecords = 0;

  // Flags
  retrievingSources = false;
  updatingStoreSource = false;

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

  constructor(
    private storeSourceService: StoreSourceService,
    private lms: SourceLocationMatchingService,
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
    this.dbEntityMarkerService.initMap(this.mapService.getMap(), selection => this.matchStore(selection.storeId),
      this.selectionService, this.casingProjectService);

    this.storeSourceLayer = new StoreSourceLayer(this.mapService);

    const boundsChangedListener = this.mapService.boundsChanged$.pipe(debounceTime(1000))
      .subscribe(() => this.onBoundsChanged());

    this.subscriptions.push(boundsChangedListener);

    this.getStoreSources();
  }

  get currentStoreSource() {
    return this.lms.storeSource;
  }

  get controls() {
    return this.dbEntityMarkerService.controls;
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
      // theres no records!
      return '0';
    } else {
      // theres already records
      const firstUnvalidatedIdx = this.storeSourceList.findIndex((r) => !r.validatedDate);
      if (firstUnvalidatedIdx === -1) {
        // theres no unvalidated records on the current page of records!

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
    sourceUpdatable.storeName = this.lms.storeSource.sourceStoreName;
    const sd = this.lms.storeSource.storeSourceData;
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
        const sd = this.lms.storeSource.storeSourceData;
        if (sd && sd.latitude && sd.longitude) {
          sourceUpdatable.latitude = sd.latitude;
          sourceUpdatable.longitude = sd.longitude;
        } else {
          const mapCenter = this.mapService.getCenter();
          sourceUpdatable.latitude = mapCenter.lat;
          sourceUpdatable.longitude = mapCenter.lng;
        }
        sourceUpdatable.storeName = this.lms.storeSource.sourceStoreName;
        this.advance(sourceUpdatable);
      });
  }

  createNewStoreForSite(siteId: number) {
    this.gettingSourceUpdatable = true;
    this.sourceUpdatableService.getUpdatableBySiteId(siteId)
      .pipe(finalize(() => (this.gettingSourceUpdatable = false)))
      .subscribe(sourceUpdatable => {
        sourceUpdatable.storeName = this.lms.storeSource.sourceStoreName;
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
    this.lms.getStoreSource(storeSourceId).subscribe((storeSource: StoreSource) => {
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
        this.lms.fetchNextStoreSource(nextStoreSource.id);
      }
    });
  }

  private initListeners() {
    const newSite = this.lms.createNewSite$.subscribe(() => this.createNewSite());
    const matchStore = this.lms.matchStore$.subscribe(storeId => this.matchStore(storeId));
    const newStore = this.lms.createNewStoreForSite$.subscribe(siteId => this.createNewStoreForSite(siteId));
    const newSiteForSc = this.lms.createNewSiteForShoppingCenter$.subscribe(siteId => this.createNewSiteForShoppingCenter(siteId));
    const markersChanged = this.dbEntityMarkerService.visibleMarkersChanged$.subscribe(() => {
      const markers = this.dbEntityMarkerService.getVisibleSiteMarkers();
      this.lms.setSiteMarkers(markers);
    });
    this.subscriptions.push(newSite);
    this.subscriptions.push(matchStore);
    this.subscriptions.push(newStore);
    this.subscriptions.push(newSiteForSc);
    this.subscriptions.push(markersChanged);
  }

  private setSourceStoreAndValidate(storeId: number) {
    this.updatingStoreSource = true;
    // Then set the store for the storeSource
    this.storeSourceService.setStore(this.lms.storeSource.id, storeId, true)
      .pipe(finalize(() => (this.updatingStoreSource = false)))
      .subscribe(() => {
        this.getStoreSources();
        this.snackBar.open(`Successfully updated record`, 'View', {duration: 4000})
          .onAction().subscribe(() => window.open(location.origin + '/casing?store-id=' + storeId, '_blank'));
      }, (err) => this.errorService.handleServerError(`Failed to update storeSource!`, err, () => console.log(err)));
  }

  private advance(sourceUpdatable: SourceUpdatable) {
    this.dialog.open(StoreSourceDataFormComponent, {data: {sourceUpdatable: sourceUpdatable, storeSource: this.lms.storeSource}})
      .afterClosed()
      .subscribe(result => {
        if (result && result.storeId) {
          this.setSourceStoreAndValidate(result.storeId);
        }
      });
  }

  private onBoundsChanged() {
    if (this.lms.storeSource && this.mapService.getMap()) {
      if (this.mapService.getZoom() >= this.dbEntityMarkerService.controls.minPullZoomLevel) {
        this.dbEntityMarkerService.getMarkersInMapView();
      } else {
        this.snackBar.open('Zoom in or change Pull zoom limit', null, {duration: 3000});
      }
    }
  }

}
