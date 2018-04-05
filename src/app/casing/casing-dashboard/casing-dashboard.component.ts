import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { MapService } from '../../core/services/map.service';
import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/site';
import { CasingDashboardService } from './casing-dashboard.service';
import { MarkerType } from '../../core/enums/MarkerType';
import { GeocoderService } from '../../core/services/geocoder.service';
import { Mappable } from '../../interfaces/mappable';
import { MapPointLayer } from '../../models/map-point-layer';
import { Color } from '../../core/enums/Color';
import { MarkerShape } from '../../core/enums/MarkerShape';
import { IconService } from '../../core/services/icon.service';
import { LabelService } from '../../core/services/label.service';
import { NavigatorService } from '../../core/services/navigator.service';
import { FindMeLayer } from '../../models/find-me-layer';
import { FollowMeLayer } from '../../models/follow-me-layer';
import { SearchComponent } from '../search/search.component';

export enum MultiSelectToolTypes {
  CLICK, CIRCLE, RECTANGLE, POLYGON
}

export enum MultiSelectMode {
  SELECT, DESELECT
}

export enum CasingDashboardMode {
  DEFAULT, FOLLOWING, MOVING_SITE, CREATING_SITE, MULTI_SELECT
}

@Component({
  selector: 'mds-casing-dashboard',
  templateUrl: './casing-dashboard.component.html',
  styleUrls: ['./casing-dashboard.component.css'],
  providers: [MapService]
})
export class CasingDashboardComponent implements OnInit {

  sites: Site[];
  selectedSites: Mappable[];
  movingSite: Mappable;
  newLocation: Mappable;

  defaultPointLayer: MapPointLayer;
  newLocationPointLayer: MapPointLayer;
  followMeLayer: FollowMeLayer;

  // Flags
  showCard = false;
  showingBoundaries = false;
  sideNavIsOpen = false;

  // Modes
  selectedDashboardMode: CasingDashboardMode = CasingDashboardMode.DEFAULT;
  selectedMultiSelectTool = MultiSelectToolTypes.CLICK;
  selectedMultiSelectMode = MultiSelectMode.SELECT;
  selectedMarkerType = MarkerType.PIN;

  // Enums for template
  casingDashboardMode = CasingDashboardMode;
  multiSelectToolType = MultiSelectToolTypes;
  multiSelectMode = MultiSelectMode;
  markerType = MarkerType;

  searchDialog: any;

  constructor(public mapService: MapService,
              public geocoderService: GeocoderService,
              public casingDashboardService: CasingDashboardService,
              private siteService: SiteService,
              private snackBar: MatSnackBar,
              private ngZone: NgZone,
              private router: Router,
              private route: ActivatedRoute,
              private labelService: LabelService,
              private iconService: IconService,
              private navigatorService: NavigatorService,
              private dialog: MatDialog) {
    this.selectedSites = [];
  }

  ngOnInit() {
    this.defaultPointLayer = new MapPointLayer({
      getMappableIsDraggable: (site: Site) => {
        return this.siteIsDraggable(site);
      },
      getMappableIcon: (site: Site) => {
        return this.getSiteIcon(site);
      },
      getMappableLabel: (site: Site) => {
        return this.getSiteLabel(site);
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
        if (this.selectedDashboardMode !== CasingDashboardMode.MOVING_SITE) {
          this.getSites(bounds);
        }
      });
    this.mapService.mapClick$.subscribe((coords: object) => {
      this.showCard = false;
      this.ngZone.run(() => this.showCard = false);
    });
    this.defaultPointLayer.markerClick$.subscribe((site: Site) => {
      if (this.selectedDashboardMode === CasingDashboardMode.MULTI_SELECT) {
        if (this.selectedMultiSelectMode === MultiSelectMode.SELECT) {
          this.selectSite(site);
        } else {
          this.deselectSite(site);
        }
        this.defaultPointLayer.refreshOptionsForMappable(site);
        this.ngZone.run(() => true);
      } else if (this.selectedDashboardMode === CasingDashboardMode.DEFAULT) { // Don't select while moving, creating or following
        this.selectedSites = [];
        this.selectSite(site);
        this.defaultPointLayer.refreshOptions();
        this.ngZone.run(() => this.showCard = true);
      }
    });
  }

  selectSite(site: Mappable) {
    this.selectedSites.push(site);
  }

  selectSites(sites: Mappable[]) {
    sites.forEach(site => this.selectSite(site));
  }

  deselectSite(site: Mappable) {
    const index = this.selectedSites.findIndex(s => s.getId() === site.getId());
    this.selectedSites.splice(index, 1);
  }

  deselectSites(sites: Mappable[]) {
    sites.forEach(site => this.deselectSite(site));
  }

  siteIsSelected(site: Site) {
    const selectedSite = this.selectedSites.find(s => s.getId() === site.getId());
    return selectedSite != null;
  }

  siteIsDraggable(site: Site) {
    // If Site is new (has no location ID) or is being moved
    return site.getId() == null ||
      (this.movingSite != null && site.getId() === this.movingSite.getId());
  }

  getSiteLabel(site: Site): any {
    if (this.selectedMarkerType === MarkerType.PIN) {
      return this.labelService.getLabel(site.getLabel()[0], Color.WHITE);
    }
    return this.labelService.getLabel(site.getLabel(), Color.BLACK);
  }

  getSiteIcon(site: Site) {
    let fillColor = Color.RED;
    if (this.siteIsDraggable(site)) {
      fillColor = Color.PURPLE;
    } else if (this.siteIsSelected(site)) {
      fillColor = Color.BLUE;
    }

    let shape: MarkerShape | google.maps.SymbolPath = MarkerShape.FILLED;
    if (this.selectedMarkerType === MarkerType.LABEL) {
      shape = google.maps.SymbolPath.CIRCLE;
    }

    return this.iconService.getIcon( fillColor, Color.WHITE, shape);
  }

  getSites(bounds): void {
    console.log('Getting Sites');
    this.siteService.getAllInBounds(bounds).subscribe(
      page => {
        this.sites = page.content.map(site => new Site(site));
        this.defaultPointLayer.clearMarkers();
        this.defaultPointLayer.createMarkersFromMappables(this.sites);
        this.mapService.addPointLayer(this.defaultPointLayer);
        // TODO Show snackbar notfication of number of sites pulled, filtered, etc.
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
    this.selectedDashboardMode = CasingDashboardMode.CREATING_SITE;
    // Create new Layer for new Location
    this.newLocationPointLayer = new MapPointLayer({
      getMappableIsDraggable: (site: Site) => {
        return true;
      },
      getMappableIcon: (site: Site) => {
        return this.iconService.getIcon(Color.PURPLE, Color.WHITE, MarkerShape.DEFAULT);
      },
      getMappableLabel: (site: Site) => {
        return null;
      }
    });
    // Create new location
    this.newLocation = {
      getCoordinates: () => {
        return this.mapService.getCenter();
      },
      getLabel: () => {
        return null;
      },
      getId: () => {
        return 0;
      }
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
      // Get Sites in drawn shape
      // TODO - Not all sites may be mapped as user draws polygon and pans screen - need to get these from Web Service
      const sites = this.defaultPointLayer.getMappablesInShape(shape);

      // Select or deselect sites
      if (this.selectedMultiSelectMode === MultiSelectMode.SELECT) {
        this.selectSites(sites);
      } else if (this.selectedMultiSelectMode === MultiSelectMode.DESELECT) {
        this.deselectSites(sites);
      }
      // Refresh marker Appearance
      this.defaultPointLayer.refreshOptions();
      // Remove drawings from maps
      this.mapService.clearDrawings();
    });
  }

  cancelMultiSelect(): void {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    // Deactivate drawing tools
    this.mapService.deactivateDrawingTools();
    // Clear Selected sites
    this.selectedSites = [];
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
    // TODO save the location data to the device
  }

  goToLocationOverview(): void {
    this.router.navigate(['location-overview', this.selectedSites[0].getId()], {relativeTo: this.route});
  }

  moveSite() {
    this.selectedDashboardMode = CasingDashboardMode.MOVING_SITE;
    this.movingSite = this.selectedSites[0];
    this.defaultPointLayer.refreshOptionsForMappable(this.movingSite);
  }

  cancelSiteMove() {
    this.selectedDashboardMode = CasingDashboardMode.DEFAULT;
    const site = this.movingSite;
    this.movingSite = null;
    this.defaultPointLayer.resetPositionOfMappable(site);
    this.defaultPointLayer.refreshOptionsForMappable(site);
  }

  saveSiteMove() {
    const coordinates = this.defaultPointLayer.getCoordinatesOfMappableMarker(this.movingSite);
    this.siteService.updateCoordinates(this.selectedSites[0].getId(), coordinates)
      .subscribe( updatedSite => {
        this.cancelSiteMove();
        this.getSites(this.mapService.getBounds());
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

  openSearch() {
    this.searchDialog = this.dialog.open(SearchComponent);
  }
}
