import { HttpClient } from '@angular/common/http';
import { RestService } from '../core/services/rest.service';
import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  allowed: number;
  file: File;

  addressField: string;
  cityField: string;
  stateField: string;
  zipField: string;

  addressIdx: number;
  cityIdx: number;
  stateIdx: number;
  zipIdx: number;

  headerRow: string;
  allRows: string[];

  index: number;
  set = 1;
  limit = 50;

  running$: Subject<boolean> = new Subject();
  output$: Subject<string[]> = new Subject();
  progress$: Subject<object> = new Subject();

  promises: Promise<any>[] = [];

  constructor(private http: HttpClient, private rest: RestService) {
    this.reset();
  }

  reset() {
    this.index = 1;
    this.allowed = null;
    this.file = null;
    this.addressField = null;
    this.cityField = null;
    this.stateField = null;
    this.zipField = null;

    this.addressIdx = null;
    this.cityIdx = null;
    this.stateIdx = null;
    this.zipIdx = null;

    this.headerRow = null;
    this.allRows = null;

    this.set = 1;
  }

  findField(field: string) {
    if (field) {
      //   console.log(this.headerRow.split(',').map(c => c.trim()));
      const idx = this.headerRow
        .split(',')
        .map(c => c.trim())
        .findIndex(f => f.toLowerCase() === field.toLowerCase());
      //   console.log(field, idx);
      if (idx >= 0) {
        return idx;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  formatWebString(s) {
    return s.replace(/&/g, 'and').replace(/#/g, '');
  }

  getURL(curr?: number) {
    // console.log('GET URL');
    curr = curr || 1;
    const r = this.allRows[this.index].split(',').map(c => c.trim());
    const addressString = [];
    if (this.addressIdx) {
      addressString.push(this.formatWebString(r[this.addressIdx]));
    }
    if (this.cityIdx) {
      addressString.push(this.formatWebString(r[this.cityIdx]));
    }
    if (this.stateIdx) {
      addressString.push(this.formatWebString(r[this.stateIdx]));
    }
    if (this.zipIdx) {
      addressString.push(this.formatWebString(r[this.zipIdx]));
    }

    const requestURL = encodeURI(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${addressString
        .join(' ')
        .trim()}&key=AIzaSyBwCet-oRMj-K7mUhd0kcX_0U1BW-xpKyQ`
    );
    this.promises.push(this.getLatLong(requestURL));
    this.index++;
    if (this.index <= this.allowed) {
      if (curr < this.limit) {
        this.getURL(curr + 1);
      } else {
        this.getPromises();
      }
    } else {
      this.getPromises(true);
    }
  }

  getPromises(save?: boolean) {
    Promise.all(this.promises).then((all: any) => {
      all.forEach((res, i) => {
        this.handleGeocodeData(res, i + 1); // array of results
      });
      this.promises = [];
      if (save) {
        this.saveData();
      } else {
        setTimeout(() => {
          this.set++;
          this.getURL();
        }, 1250);
      }
    });
  }

  handleGeocodeData(data, index) {
    let text = '';
    const factoredIdx = index + (this.set * this.limit - this.limit);

    console.log(data, factoredIdx);

    if (data.results.length && index <= this.allowed) {
      const latitude = data.results[0].geometry.location.lat;
      const longitude = data.results[0].geometry.location.lng;
      const geotype = data.results[0].geometry.location_type;
      const matchedAddress = data.results[0].formatted_address.replace(
        /,/g,
        ' '
      );
      text = `Found ${matchedAddress} at ${latitude}/${longitude}`;

      this.allRows[
        factoredIdx
      ] += `,${latitude},${longitude},${geotype},${matchedAddress}`;
    } else {
      text = 'Failed to get data';
      this.allRows[factoredIdx] += `,,,,${text}`;
    }
    this.progress$.next({
      done: factoredIdx,
      total: this.allowed,
      text: text
    });
  }

  getLatLong(url) {
    return this.http.get<any>(url).toPromise();
  }

  saveData = () => {
    const blob = new Blob([this.allRows.join('\r\n')], {
      type: 'text/plain'
    });
    saveAs(blob, `${this.file.name.replace('.csv', '')}_geocoded.csv`);
    this.running$.next(false);
    this.output$.next(this.allRows);
  };

  getHeaderRowArray(file) {
    const allRows = file.fileOutput
      .trim()
      .split('\r\n')
      .map(r => r.trim())
      .map(r => r);
    return allRows[0].split(',').filter(r => r);
  }

  getRowLength(file) {
    const allRows = file.fileOutput
      .trim()
      .split('\r\n')
      .map(r => r.trim())
      .map(r => r);
    return allRows.length - 1;
  }

  handleFile(file, address, city, state, zip) {
    // console.log(file);

    this.running$.next(true);

    this.file = file.file;
    this.addressField = address;
    this.cityField = city;
    this.stateField = state;
    this.zipField = zip;

    // console.log(this.file, this.addressField, this.cityField, this.stateField, this.zipField)

    this.allRows = file.fileOutput
      .trim()
      .split('\r\n')
      .map(r => r.trim())
      .map(r => r);
    this.allRows[0] += ',lat,lng,geotype,matched_address';
    this.allowed = this.allRows.length - 1; // exclude the header row
    this.headerRow = this.allRows[0];

    this.addressIdx = this.addressField
      ? this.findField(this.addressField)
      : null;
    this.cityIdx = this.cityField ? this.findField(this.cityField) : null;
    this.stateIdx = this.stateField ? this.findField(this.stateField) : null;
    this.zipIdx = this.zipField ? this.findField(this.zipField) : null;

    console.log(this.addressIdx, this.cityIdx, this.stateIdx, this.zipIdx);
    this.getURL();
  }
}
