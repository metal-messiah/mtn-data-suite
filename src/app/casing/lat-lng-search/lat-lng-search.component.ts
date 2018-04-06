import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Coordinates } from '../../models/coordinates';

@Component({
  selector: 'mds-lat-lng-search',
  templateUrl: './lat-lng-search.component.html',
  styleUrls: ['./lat-lng-search.component.css']
})
export class LatLngSearchComponent {

  @Output() onSubmitted = new EventEmitter<Coordinates>();

  regex = new RegExp('^([-\\.\\d]+)[^-\\d]+([-\\.\\d]+)$');
  latLngFormControl = new FormControl('', [
    Validators.pattern(this.regex)
  ]);

  constructor() { }

  submit() {
    const values = this.regex.exec(this.latLngFormControl.value);
    const lat = parseFloat(values[1]);
    const lng = parseFloat(values[2]);

    this.onSubmitted.emit({lat: lat, lng: lng});
  }

}
