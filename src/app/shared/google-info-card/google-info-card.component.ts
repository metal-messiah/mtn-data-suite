import { Component, Input, OnInit } from '@angular/core';
import { GoogleInfoCardItem } from '../../casing/google-info-card-item';
import { GooglePlace } from '../../models/google-place';

@Component({
  selector: 'mds-google-info-card',
  templateUrl: './google-info-card.component.html',
  styleUrls: ['./google-info-card.component.css']
})
export class GoogleInfoCardComponent implements OnInit {

  @Input() infoCardItem: GoogleInfoCardItem;
  @Input() disabled: boolean;

  googlePlace: GooglePlace;

  constructor() { }

  ngOnInit() {
    this.googlePlace = this.infoCardItem.googlePlace;
  }

}
