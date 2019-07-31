import { Component, OnInit } from '@angular/core';
import { StoreCasingDetailService } from '../store-casing-detail.service';

@Component({
  selector: 'mds-store-status',
  templateUrl: './store-status.component.html',
  styleUrls: ['./store-status.component.css', '../casing-defaults.css']
})
export class StoreStatusComponent implements OnInit {

  readonly storeStatusOptions = ['Closed', 'Dead Deal', 'New Under Construction', 'Open', 'Planned', 'Proposed', 'Remodel',
    'Rumored', 'Strong Rumor', 'Temporarily Closed'];

  constructor(private service: StoreCasingDetailService) { }

  ngOnInit() {
  }

  get storeCasingForm() {
    return this.service.storeCasingForm;
  }

}
