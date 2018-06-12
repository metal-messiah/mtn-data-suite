import { Component, OnInit } from '@angular/core';
import {SourceService} from '../../core/services/source.service';
import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from 'constants';

@Component({
  selector: 'mds-planned-grocery',
  templateUrl: './planned-grocery.component.html',
  styleUrls: ['./planned-grocery.component.css']
})
export class PlannedGroceryComponent implements OnInit {
  sourceService: SourceService;
  records: object[];
  currentRecord: object;
  currentRecordIndex: number;

  constructor(ss: SourceService) { 
    this.sourceService = ss;
  }

  ngOnInit() {
    this.records = this.sourceService.getSourceTable()
    this.currentRecord = Object.assign({}, this.records[0]);
    this.currentRecordIndex = 0;
  }

  handleRecordClick(index: number){
    this.currentRecordIndex = index;
  }

}
