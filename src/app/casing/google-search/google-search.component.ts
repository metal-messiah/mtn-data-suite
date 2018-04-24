import { Component, NgZone } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormControl } from '@angular/forms';
import { GooglePlace } from '../../models/google-place';
import { MapService } from '../../core/services/map.service';

@Component({
  selector: 'mds-search',
  templateUrl: './google-search.component.html',
  styleUrls: ['./google-search.component.css']
})
export class GoogleSearchComponent {

  places: GooglePlace[];
  googleFormControl = new FormControl('');
  noSearchResults = false;

  constructor(public dialogRef: MatDialogRef<GoogleSearchComponent>,
              private mapService: MapService,
              private ngZone: NgZone) { }

  closeDialog() {
    this.dialogRef.close();
  }

  search() {
    const queryString = this.googleFormControl.value;
    this.mapService.searchFor(queryString).subscribe( (searchResults: GooglePlace[]) => {
      this.noSearchResults = (searchResults.length === 0);
      this.ngZone.run(() => this.places = searchResults);
    });
  }

  goToStore(place: GooglePlace) {
    this.dialogRef.close({place: place});
  }

  searchWithMap() {
    this.dialogRef.close({
      query: this.googleFormControl.value
    });
  }

}
