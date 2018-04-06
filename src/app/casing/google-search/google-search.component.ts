import { Component, NgZone } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormControl } from '@angular/forms';
import { GooglePlacesService } from 'app/core/services/google-places.service';
import { GooglePlace } from '../../models/GooglePlace';

@Component({
  selector: 'mds-search',
  templateUrl: './google-search.component.html',
  styleUrls: ['./google-search.component.css']
})
export class GoogleSearchComponent {

  places: GooglePlace[];
  googleFormControl = new FormControl('');

  constructor(public dialogRef: MatDialogRef<GoogleSearchComponent>,
              private searchService: GooglePlacesService,
              private ngZone: NgZone) { }

  closeDialog() {
    this.dialogRef.close();
  }

  search() {
    const queryString = this.googleFormControl.value;
    this.searchService.searchFor(queryString).subscribe( (searchResults: GooglePlace[]) => {
      this.ngZone.run(() => this.places = searchResults);
    });
  }

  goToPlace(place) {
    this.dialogRef.close(place);
  }

}
