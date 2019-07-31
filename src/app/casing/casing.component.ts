import { Component } from '@angular/core';
import { CasingProjectService } from './casing-project.service';

@Component({
  selector: 'mds-casing',
  templateUrl: './casing.component.html',
  styleUrls: ['./casing.component.css'],
  providers: [CasingProjectService]
})
export class CasingComponent {

  constructor() {}

}
