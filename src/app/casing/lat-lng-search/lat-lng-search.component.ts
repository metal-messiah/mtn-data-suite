import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'mds-search',
  templateUrl: './lat-lng-search.component.html',
  styleUrls: ['./lat-lng-search.component.css']
})
export class LatLngSearchComponent {

  regex = new RegExp('^(-?[\.\\d]+)[^-\.\\d]+(-?[\.\\d]+)$');
  latLngFormControl = new FormControl('', [
    Validators.pattern(this.regex)
  ]);

  constructor(public dialogRef: MatDialogRef<LatLngSearchComponent>) { }

  closeDialog() {
    this.dialogRef.close();
  }

  submit() {
    const values = this.regex.exec(this.latLngFormControl.value);
    const lat = parseFloat(values[1]);
    const lng = parseFloat(values[2]);

    this.dialogRef.close({lat: lat, lng: lng});
  }

}
