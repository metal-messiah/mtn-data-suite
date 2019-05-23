import { Component, NgZone, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { GooglePlace } from '../../models/google-place';
import { MapService } from '../../core/services/map.service';


@Component({
  selector: 'mds-search',
  templateUrl: './google-search.component.html',
  styleUrls: ['./google-search.component.css']
})
export class GoogleSearchComponent implements AfterViewInit {

  searchQuery = '';
  autocomplete: google.maps.places.Autocomplete;
  autocompleteResult: google.maps.places.PlaceResult = null;
  autocompleteValidate = '';

  @ViewChild('searchInput') searchInput: any;

  constructor(public dialogRef: MatDialogRef<GoogleSearchComponent>,
    private mapService: MapService,
    private ngZone: NgZone) { }

  ngAfterViewInit() {
    this.initAutocomplete();
  }

  initAutocomplete() {
    this.autocomplete = new google.maps.places.Autocomplete(this.searchInput.nativeElement, {
      componentRestrictions: { country: 'US' },
      types: []  // all search types
    });
    this.autocomplete.bindTo('bounds', this.mapService.getMap());
    this.autocomplete.addListener('place_changed', () => {
      this.autocompleteResult = new GooglePlace(this.autocomplete.getPlace());
      this.autocompleteValidate = this.searchQuery; // for checking if input has changed vs autocomplete

      // google autocomplete selection event doesnt re-paint the DOM, force it here...
      this.ngZone.run(() => { })
    })
  }

  validate() {
    if (this.autocompleteResult && this.autocompleteValidate && this.autocompleteValidate !== this.searchQuery) {
      // search query must have changed since the time we set the placeResult!!!
      this.autocompleteResult = null;
      this.autocompleteValidate = '';
    }
  }

  isValidSearch() {
    return this.searchQuery !== '' && this.searchQuery.length >= 3
  }

  getSubmitButtonText() {
    return this.isValidSearch() ?
      this.autocompleteValidate !== '' ? 'Go to Exact Match' : 'Show All Matches As I Navigate' :
      'Invalid Search Terms';
  }

  getBadge(): string {
    return this.isValidSearch() ? this.autocompleteValidate !== '' ? '1' : '∞' : null;
  }

  getBadgeColor() {
    return this.isValidSearch() ? 'accent' : 'warn'
  }

  closeDialog() {
    this.dialogRef.close();
  }

  submit() {
    if (this.autocompleteResult) {
      this.dialogRef.close({
        place: this.autocompleteResult
      })
    } else {
      this.dialogRef.close({
        query: this.searchQuery
      });
    }
  }

}
