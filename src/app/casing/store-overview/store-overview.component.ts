import { Component, Input, OnInit } from '@angular/core';
import { StoreCasing } from '../../models/store-casing';
import { SimplifiedStoreCasing } from '../../models/simplified-store-casing';
import { StoreCasingService } from '../../core/services/store-casing.service';

@Component({
  selector: 'mds-store-overview',
  templateUrl: './store-overview.component.html',
  styleUrls: ['./store-overview.component.css']
})
export class StoreOverviewComponent implements OnInit {

  @Input() store;
  selectedStoreCasing: StoreCasing;

  constructor(private storeCasingService: StoreCasingService) { }

  ngOnInit() {
  }

  onCasingOpened(casing: SimplifiedStoreCasing) {
    this.selectedStoreCasing = null;
    this.storeCasingService.getOneById(casing.id).subscribe(c => {
      this.selectedStoreCasing = c;
      console.log(c);
    });
  }

}
