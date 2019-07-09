import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'mds-sub-title-bar',
  templateUrl: './sub-title-bar.component.html',
  styleUrls: ['./sub-title-bar.component.css']
})
export class SubTitleBarComponent implements OnInit {

  @Input() subTitle: string;
  @Input() hideBackButton: boolean;

  constructor(private _location: Location) { }

  ngOnInit() {
  }

  goBack() {
    this._location.back();
  }

}
