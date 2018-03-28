import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { MapService } from '../../core/services/map.service';
import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/site';
import { debounceTime } from 'rxjs/operators';
import { CasingDashboardService } from './casing-dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MarkerType } from '../../core/enums/MarkerType';

export enum ToolbarType {
  MULTI_SELECT, NEW_SITE, DEFAULT
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
export class CasingDashboardComponent implements OnInit, OnDestroy {

  searchQuery: string;
  sites: Site[];
  selectedSite: Site = null;
  showCard = false;
  showingBoundaries = false;
  sideNavIsOpen = false;
  markerType = MarkerType;
  navigatorWatch: number;
  mode: CasingDashboardMode = CasingDashboardMode.DEFAULT;
  modeType = CasingDashboardMode;

  constructor(public mapService: MapService,
              public casingDashboardService: CasingDashboardService,
              private siteService: SiteService,
              private snackBar: MatSnackBar,
              private ngZone: NgZone,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.searchQuery = 'search query';
  }

  ngOnDestroy() {
    console.log('Destroying CasingDashboardComponent');
  }

  onMapReady(event) {
    console.log(`Map is ready: ${event}`);
    this.casingDashboardService.getSavedPerspective().subscribe(perspective => {
      if (perspective != null) {
        this.mapService.setCenter(perspective.latitude, perspective.longitude);
        this.mapService.setZoom(perspective.zoom);
      } else {
        this.mapService.setCenter(40.356714, -111.770421);
        this.mapService.setZoom(10);
      }
    });

    this.mapService.boundsChanged$
      .pipe(debounceTime(750))
      .subscribe(bounds => {
        const perspective = this.mapService.getPerspective();
        this.casingDashboardService.savePerspective(perspective).subscribe();
        if (this.mode !== CasingDashboardMode.MOVING_SITE) {
          this.getSites(bounds);
        }
      });

    this.mapService.markerClick$.subscribe((site: Site) => {
      if (this.mode === CasingDashboardMode.MULTI_SELECT) {
        this.mapService.addMappableToSelection(site);
      } else if (this.mode === CasingDashboardMode.DEFAULT) { // Don't select while moving, creating or following
        this.selectedSite = site;
        this.mapService.selectSingleMappable(site);
        this.ngZone.run(() => this.showCard = true);
      }
    });
    this.mapService.mapClick$.subscribe((coords: object) => {
      this.selectedSite = null;
      this.ngZone.run(() => this.showCard = false);
    });

  }

  getSites(bounds): void {
    console.log('Getting Sites');
    this.siteService.getAllInBounds(bounds).subscribe(
      page => {
        this.sites = page.content.map(site => new Site(site));
        this.mapService.drawMappables(this.sites);
        // if (page.totalPages > 1) {
        //   this.snackBar.open(`Not all Locations showing! Zoom in to see all`, null, {duration: 1500});
        // } else {
        //   this.snackBar.open(`Locations visible: ${page.content.length}`, null, {duration: 1500});
        // }
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
    this.mode = CasingDashboardMode.CREATING_SITE;
    this.mapService.createNewMarker();
  }

  cancelLocationCreation(): void {
    this.mapService.deleteNewMarker();
    this.mode = CasingDashboardMode.DEFAULT;
  }

  editNewLocation(): void {
    this.mapService.getNewMarkerAddress().subscribe((address: Site) => {
      this.casingDashboardService.newSite = new Site(address);
      this.router.navigate(['site-detail'], {relativeTo: this.route});
    }, (err) => console.error(err));
  }

  multiSelect(): void {
    this.sideNavIsOpen = false;
    // this.mapService.setMarkerType(MarkerType.PIN);
    this.mode = CasingDashboardMode.MULTI_SELECT;
    this.mapService.activateMultiSelect();
  }

  cancelMultiSelect(): void {
    this.mode = CasingDashboardMode.DEFAULT;
    this.mapService.deactivateMultiSelect();
  }

  findMe(): void {
    this.sideNavIsOpen = false;
    if (this.mode !== CasingDashboardMode.FOLLOWING) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.mapService.findMe(position.coords.latitude, position.coords.longitude);
        }, (err) => {
          // TODO tell user can't show location
          console.error(`Can't show location: ${err}`);
        });
      } else {
        // TODO Browser doesn't support Geolocation
        console.error('Browser doesn\'t support Geolocation!');
      }
    }
  }

  activateFollowMe(): void {
    this.mode = CasingDashboardMode.FOLLOWING;
    this.sideNavIsOpen = false;
    if (navigator.geolocation) {
      const options = {
        maximumAge: 2000
      };
      this.navigatorWatch = navigator.geolocation.watchPosition((position) => {
        this.mapService.followMe(position.coords.latitude, position.coords.longitude);
      }, () => {
        // TODO tell user can't show location
      }, options);
    } else {
      // TODO Browser doesn't support Geolocation
    }
  }

  deactivateFollowMe(): void {
    this.mode = CasingDashboardMode.DEFAULT;
    this.sideNavIsOpen = false;
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(this.navigatorWatch);
    }
    this.mapService.stopFollowingMe();
  }

  pinLocation(): void {
    // TODO save the location data to the device
  }

  goToLocationOverview(): void {
    this.router.navigate(['location-overview', this.selectedSite.getId()], {relativeTo: this.route});
  }

  moveSite() {
    this.mode = CasingDashboardMode.MOVING_SITE;
    this.mapService.setMappableAsDraggable(this.selectedSite);
  }

  cancelSiteMove() {
    this.mode = CasingDashboardMode.DEFAULT;
    this.mapService.cancelMappableMove();
  }

  saveSiteMove() {
    const coordinates = this.mapService.getMovedMappableCoordinates();
    this.siteService.getById(this.selectedSite.getId()).subscribe(site => {
      // Web service requires lng first
      site.location.coordinates = [coordinates['lng'], coordinates['lat']];
      this.siteService.save(site).subscribe(savedSite => {
        this.mode = CasingDashboardMode.DEFAULT;
        this.mapService.setMappableAsDraggable(null);
        this.getSites(this.mapService.getBounds());
      }, error => console.log(error));
    }, err => {
      console.error('Moved Site not found in DB');
    });

  }
}
