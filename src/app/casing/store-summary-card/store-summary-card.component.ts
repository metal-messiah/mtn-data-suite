import { Component, Input, OnInit } from '@angular/core';
import { Store } from '../../models/store';

@Component({
  selector: 'mds-store-summary-card',
  templateUrl: './store-summary-card.component.html',
  styleUrls: ['./store-summary-card.component.css']
})
export class StoreSummaryCardComponent implements OnInit {

  @Input() store: Store;

  constructor() { }

  ngOnInit() {
  }

}
