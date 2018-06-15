import { Component, Input, OnInit } from '@angular/core';
import { Store } from '../../models/full/store';

@Component({
  selector: 'mds-store-entity-form',
  templateUrl: './store-entity-form.component.html',
  styleUrls: ['./store-entity-form.component.css']
})
export class StoreEntityFormComponent implements OnInit {

  @Input() store: Store;
  @Input() isReadOnly = true;

  constructor() { }

  ngOnInit() {
  }

}
