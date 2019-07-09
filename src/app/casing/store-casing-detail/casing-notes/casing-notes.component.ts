import { Component, OnInit } from '@angular/core';
import { StoreCasingDetailService } from '../store-casing-detail.service';

@Component({
  selector: 'mds-casing-notes',
  templateUrl: './casing-notes.component.html',
  styleUrls: ['./casing-notes.component.css']
})
export class CasingNotesComponent implements OnInit {

  constructor(private service: StoreCasingDetailService) { }

  ngOnInit() {
  }

  get storeCasingForm() {
    return this.service.storeCasingForm;
  }

  get shoppingCenterCasingForm() {
    return this.service.shoppingCenterCasingForm;
  }

}
