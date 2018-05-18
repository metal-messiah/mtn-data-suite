import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'mds-data-field',
  templateUrl: './data-field.component.html',
  styleUrls: ['./data-field.component.css']
})
export class DataFieldComponent implements OnInit {

  @Input() title;
  @Input() value;
  @Input() dateValue;

  constructor() { }

  ngOnInit() {
  }

}
