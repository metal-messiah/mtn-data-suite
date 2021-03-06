import { AfterViewInit, Component, Inject, NgZone, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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

  @ViewChild('searchInput', {static: true}) searchInput: any;

  mapService: MapService;

  constructor(private dialogRef: MatDialogRef<GoogleSearchComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { mapService: MapService },
              private ngZone: NgZone) {
    if (!data || !data.mapService) {
      console.error('mapService must be provided by caller of GoogleSearchComponent!');
      this.dialogRef.close();
    } else {
      this.mapService = data.mapService;
    }
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
    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (place.address_components != null && place.address_components.length) {
        this.autocompleteResult = new GooglePlace(place);
        this.autocompleteValidate = this.searchQuery; // for checking if input has changed vs autocomplete

        // google autocomplete selection event doesn't re-paint the DOM, force it here...
        this.ngZone.run(() => { });
      }
    });
  }

  validate() {
    if (this.autocompleteResult && this.autocompleteValidate && this.autocompleteValidate !== this.searchQuery) {
      // search query must have changed since the time we set the placeResult!!!
      this.autocompleteResult = null;
      this.autocompleteValidate = '';
    }
  }

  isValidSearch() {
    return this.searchQuery !== '' && this.searchQuery.length >= 3;
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
    return this.isValidSearch() ? 'accent' : 'warn';
  }

  closeDialog() {
    this.dialogRef.close();
  }

  submit() {
    if (this.autocompleteResult) {
      this.dialogRef.close({
        place: this.autocompleteResult
      });
    } else {
      this.dialogRef.close({
        query: this.searchQuery
      });
    }
  }

}
