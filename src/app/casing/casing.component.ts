import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CasingService } from './casing.service';

@Component({
  selector: 'mds-casing',
  templateUrl: './casing.component.html',
  styleUrls: ['./casing.component.css']
})
export class CasingComponent implements OnInit {

  constructor(public casingService: CasingService) { }

  ngOnInit() {
  }
}
