import { Component, NgZone, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { MapService } from '../../core/services/map.service';
import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/site';
import { debounceTime } from 'rxjs/operators';
import { CasingService } from '../casing.service';
import { Router } from '@angular/router';
import { MarkerType } from '../../core/enums/MarkerType';

export enum ToolbarType {
  MULTI_SELECT, NEW_SITE, DEFAULT
}

@Component({
  selector: 'mds-casing-dashboard',
  templateUrl: './casing-dashboard.component.html',
  styleUrls: ['./casing-dashboard.component.css'],
  providers: [MapService]
})
export class CasingDashboardComponent implements OnInit {

  searchQuery: string;
  sites: Site[];
  selectedSite: Site = null;
  showCard = false;
  showingBoundaries = false;
  sideNavIsOpen = false;
  markerType = MarkerType;
  toolbarType = ToolbarType;
  activeToolbar = ToolbarType.DEFAULT;
  following = false;
  navigatorWatch: number;

  constructor(public mapService: MapService,
              public casingService: CasingService,
              private siteService: SiteService,
              private snackBar: MatSnackBar,
              private ngZone: NgZone,
              private router: Router) {
  }

  ngOnInit() {
    this.searchQuery = 'search query';
  }

  onMapReady(event) {
    console.log(`Map is ready: ${event}`);
    navigator.geolocation.getCurrentPosition(
      position => {
        this.mapService.setCenter(position.coords.latitude, position.coords.longitude);
        this.mapService.setZoom(15);
      },
      error => {
        this.mapService.setCenter(40.356714, -111.770421);
        this.mapService.setZoom(10);
        console.log(error);
      },
      {});

    this.mapService.getBoundsChanged()
      .pipe(debounceTime(500))
      .subscribe(bounds => this.getSites(bounds));

    this.mapService.getMarkerClick().subscribe((id: number) => this.selectSite(id));
    this.mapService.getMapClick().subscribe((coords: object) => {
      this.selectedSite = null;
      this.ngZone.run(() => this.showCard = false);
    });

  }

  selectSite(id: number) {
    this.selectedSite = this.sites.find(site => site.id === id);
    this.ngZone.run(() => this.showCard = true);
    console.log(this.selectedSite);
  }

  getSites(bounds): void {
    console.log('Getting Sites');
    this.siteService.getAllInBounds(bounds).subscribe(
      page => {
        console.log(page.content);
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
    this.activeToolbar = ToolbarType.NEW_SITE;
    this.mapService.createNewMarker();
  }

  cancelLocationCreation(): void {
    this.mapService.deleteNewMarker();
    this.activeToolbar = ToolbarType.DEFAULT;
  }

  editNewLocation(): void {
    this.mapService.getNewMarkerAddress().subscribe((address: Site) => {
      this.casingService.newSite = new Site(address);
      this.router.navigate(['site-detail']);
    }, (err) => console.error(err));
  }

  multiSelect(): void {
    this.sideNavIsOpen = false;
    // this.mapService.setMarkerType(MarkerType.PIN);
    this.activeToolbar = ToolbarType.MULTI_SELECT;
    this.mapService.activateMultiSelect();
  }

  cancelMultiSelect(): void {
    this.activeToolbar = ToolbarType.DEFAULT;
    this.mapService.deactivateMultiSelect();
  }

  findMe(): void {
    this.sideNavIsOpen = false;
    if (!this.following) {
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
    this.following = true;
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
    this.following = false;
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(this.navigatorWatch);
    }
    this.mapService.stopFollowingMe();
  }
}
