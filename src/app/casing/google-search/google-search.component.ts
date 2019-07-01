import { Component, Inject, NgZone } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GooglePlace } from '../../models/google-place';
import { MapService } from '../../core/services/map.service';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'mds-search',
  templateUrl: './google-search.component.html',
  styleUrls: ['./google-search.component.css']
})
export class GoogleSearchComponent {

  places: GooglePlace[];
  searchQuery = '';
  searchError;
  searching = false;
  limitToView = false;

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
    this.dialogRef.close({place: place});
  }

  searchWithMap() {
    this.dialogRef.close({
      query: this.searchQuery
    });
  }

}
