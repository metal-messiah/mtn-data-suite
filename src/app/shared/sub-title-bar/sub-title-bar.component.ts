import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'mds-sub-title-bar',
  templateUrl: './sub-title-bar.component.html',
  styleUrls: ['./sub-title-bar.component.css']
})
export class SubTitleBarComponent {

  @Input() subTitle: string;
  @Input() hideBackButton: boolean;

  constructor(private _location: Location) { }

  goBack() {
    this._location.back();
  }

}
