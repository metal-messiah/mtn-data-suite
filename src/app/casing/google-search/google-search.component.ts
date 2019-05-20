import { Component, NgZone, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { GooglePlace } from '../../models/google-place';
import { MapService } from '../../core/services/map.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'mds-search',
  templateUrl: './google-search.component.html',
  styleUrls: ['./google-search.component.css']
})
export class GoogleSearchComponent implements OnInit, AfterViewInit {

  places: GooglePlace[];
  searchQuery = '';
  searchError;
  searching = false;
  limitToView = false;

  @ViewChild('searchInput') searchInput: any;
  autocomplete: google.maps.places.Autocomplete;

  constructor(public dialogRef: MatDialogRef<GoogleSearchComponent>,
    private mapService: MapService,
    private ngZone: NgZone) {

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.initAutocomplete();
  }

  initAutocomplete() {
    this.autocomplete = new google.maps.places.Autocomplete(this.searchInput.nativeElement, {
      componentRestrictions: { country: 'US' },
      types: []  // all search types
    });
    this.autocomplete.bindTo('bounds', this.mapService.getMap());
  }

  closeDialog() {
    this.dialogRef.close();
  }

  search() {
    this.places = [];
    this.searchError = null;
    this.searching = true;
    this.mapService.searchFor(this.searchQuery, this.limitToView ? this.mapService.getBounds() : null)
      .pipe(finalize(() => this.searching = false))
      .subscribe((searchResults: GooglePlace[]) => {
        this.ngZone.run(() => this.places = searchResults);
      }, (error) => this.searchError = error);
  }

  goToStore(place: GooglePlace) {
    this.dialogRef.close({ place: place });
  }

  searchWithMap() {
    this.dialogRef.close({
      query: this.searchQuery
    });
  }

}
