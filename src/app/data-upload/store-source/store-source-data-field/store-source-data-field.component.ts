import { Component, Input, OnInit } from '@angular/core';
import { StoreSource } from '../../../models/full/store-source';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'mds-store-source-data-field',
  templateUrl: './store-source-data-field.component.html',
  styleUrls: ['./store-source-data-field.component.css']
})
export class StoreSourceDataFieldComponent implements OnInit {

  @Input() attrName: string;
  @Input() displayName: string;
  @Input() type: string;
  @Input() storeSource: StoreSource;
  @Input() updatableForm: FormGroup;

  constructor() { }

  ngOnInit() {
  }

  copy(attrName: string) {
    const value = this.storeSource.storeSourceData[attrName];
    const control = this.updatableForm.get(attrName);
    control.setValue(value);
    control.markAsDirty();
  }

  isDifferent(attrName: string) {
    return this.updatableForm.get(attrName).value !== this.storeSource.storeSourceData[attrName];
  }
}
