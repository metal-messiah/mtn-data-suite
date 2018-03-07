import { Component, NgZone, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { MapService } from '../../core/services/map.service';
import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/site';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-casing-dashboard',
  templateUrl: './casing-dashboard.component.html',
  styleUrls: ['./casing-dashboard.component.css'],
  providers: [MapService]
})
export class CasingDashboardComponent implements OnInit {

  searchQuery: string;
  sites: Site[];
  selectedSite: Site = null;
  showCard = false;

  constructor(private mapService: MapService,
              private siteService: SiteService,
              private snackBar: MatSnackBar,
              private ngZone: NgZone) {
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

  toggleMode(): void {
    this.mapService.toggleMode();
  }
}
