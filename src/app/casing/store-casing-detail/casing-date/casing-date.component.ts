import { Component, OnInit } from '@angular/core';
import { StoreCasingDetailService } from '../store-casing-detail.service';

@Component({
  selector: 'mds-casing-date',
  templateUrl: './casing-date.component.html',
  styleUrls: ['./casing-date.component.css', '../casing-defaults.css']
})
export class CasingDateComponent implements OnInit {

  constructor(private service: StoreCasingDetailService) { }

  ngOnInit() {
  }

  get storeCasingForm() {
    return this.service.storeCasingForm;
  }

}
