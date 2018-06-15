import { Component, OnInit } from '@angular/core';
import { ShoppingCenter } from '../../models/full/shopping-center';

@Component({
  selector: 'mds-shopping-center-detail',
  templateUrl: './shopping-center-detail.component.html',
  styleUrls: ['./shopping-center-detail.component.css']
})
export class ShoppingCenterDetailComponent implements OnInit {

  shoppingCenter: ShoppingCenter;

  constructor() { }

  ngOnInit() {
  }

}
