import { Injectable } from "@angular/core";
import { Observable, of, Subject } from "rxjs";
import { SpreadsheetRecord } from "../../models/spreadsheet-record";
// import * as records from './DFW.json';

@Injectable({
  providedIn: "root"
})
export class SpreadsheetService {
  // records = records['features'];
  uniqueIdLabels = ["unique_id", "uid", "id"];
  latLabels = ["lat", "latitude", "y"];
  lngLabels = ["lng", "long", "longitude", "x"];
  nameLabels = ["name", "storeName", "store name"];

  id_idx: number;
  lat_idx: number;
  lng_idx: number;
  name_idx: number;

  fieldsAreAssigned$: Subject<boolean> = new Subject();

  constructor() {}

  cleanFieldname(field) {
    return field.trim().toLowerCase();
  }

  mapToSpreadsheet(csvAsText: string): Observable<any> {
    const csvArray = csvAsText.split("\n").map(row => row.split(","));

    return of(
      csvArray.map((row, i) => {
        // skip the header row
        if (i) {
          return new SpreadsheetRecord(
            row[this.id_idx],
            Number(row[this.lat_idx]),
            Number(row[this.lng_idx]),
            row[this.name_idx]
          );
        }
      })
    );
  }

  getFields(csvAsText: string) {
    const fields = csvAsText.split("\n")[0].split(",");
    return fields;
  }

  getFieldIndices(fields) {
    this.id_idx = fields.findIndex(field =>
      this.uniqueIdLabels.includes(this.cleanFieldname(field))
    );
    this.lat_idx = fields.findIndex(field =>
      this.latLabels.includes(this.cleanFieldname(field))
    );
    this.lng_idx = fields.findIndex(field =>
      this.lngLabels.includes(this.cleanFieldname(field))
    );
    this.name_idx = fields.findIndex(field =>
      this.nameLabels.includes(this.cleanFieldname(field))
    );

    if (this.lat_idx >= 0 && this.lng_idx >= 0 && this.name_idx >= 0) {
      return this.fieldsAreAssigned$.next(true);
    } else {
      return this.fieldsAreAssigned$.next(false);
    }
  }

  parseSpreadsheet(csvAsText: string, fields: string[]): Observable<any> {
    if (this.lat_idx >= 0 && this.lng_idx >= 0 && this.name_idx >= 0) {
      return this.mapToSpreadsheet(csvAsText);
    } else {
      return of([]);
    }
  }

  assignFields(
    fields: string[],
    assignments: {
      lat: string;
      lng: string;
      name: string;
      company: string;
      storeNumber: string;
      matchType: string;
    }
  ) {
    this.lat_idx = fields.findIndex(field => field === assignments.lat);
    this.lng_idx = fields.findIndex(field => field === assignments.lng);
    this.name_idx = fields.findIndex(field => field === assignments.name);

    if (assignments.lat && assignments.lng && assignments.name) {
      this.fieldsAreAssigned$.next(true);
    } else {
      this.fieldsAreAssigned$.next(false);
    }
  }

  // loadSpreadsheet(): Observable<SpreadsheetRecord[]> {
  //   const getUniqueId = feature => feature['unique_id'];
  //   const getLatitude = feature => feature['Latitude'];
  //   const getLongitude = feature => feature['Longitude'];
  //   const getName = feature => feature['Label'];

  //   return of(
  //     this.records.map(
  //       r =>
  //         new SpreadsheetRecord(
  //           getUniqueId(r),
  //           getLatitude(r),
  //           getLongitude(r),
  //           getName(r)
  //         )
  //     )
  //   );
  // }
}
