import { Component, Input } from '@angular/core';

@Component({
  selector: 'mds-sub-title-bar',
  templateUrl: './sub-title-bar.component.html',
  styleUrls: ['./sub-title-bar.component.css']
})
export class SubTitleBarComponent {

  @Input() subTitle: string;
  @Input() hideBackButton: boolean;
  @Input() color = '#a5c0ce';

  constructor() {}

}
