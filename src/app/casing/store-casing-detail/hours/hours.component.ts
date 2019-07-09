import { Component, OnInit } from '@angular/core';
import { StoreCasingDetailService } from '../store-casing-detail.service';

@Component({
  selector: 'mds-hours',
  templateUrl: './hours.component.html',
  styleUrls: ['./hours.component.css', '../casing-defaults.css']
})
export class HoursComponent implements OnInit {

  constructor(private service: StoreCasingDetailService) { }

  ngOnInit() {
  }

  get storeForm() {
    return this.service.storeForm;
  }

}
