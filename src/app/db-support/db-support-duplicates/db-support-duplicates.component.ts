import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'mds-db-support-duplicates',
  templateUrl: './db-support-duplicates.component.html',
  styleUrls: ['./db-support-duplicates.component.css']
})
export class DbSupportDuplicatesComponent implements OnInit {

  isLinear = true;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({secondCtrl: ['', Validators.required]
    });
  }

}
