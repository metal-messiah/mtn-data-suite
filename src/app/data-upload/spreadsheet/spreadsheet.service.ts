import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SpreadsheetRecord } from '../../models/spreadsheet-record';
import * as records from './DFW.json';

@Injectable({
  providedIn: 'root'
})
export class SpreadsheetService {

  records = records['features'];

  constructor() {
  }

  loadSpreadsheet(): Observable<SpreadsheetRecord[]> {
    const getUniqueId = (feature => feature['unique_id']);
    const getLatitude = (feature => feature['Latitude']);
    const getLongitude = (feature => feature['Longitude']);
    const getName = (feature => feature['Label']);

    return of(this.records.map(r => new SpreadsheetRecord(getUniqueId(r), getLatitude(r), getLongitude(r), getName(r))));
  }
}
