import { HttpClient } from '@angular/common/http';
import { RestService } from '../core/services/rest.service';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ResourceQuota } from '../models/resource-quota';
import { ResourceQuotaService } from '../core/services/resource-quota.service';
import { ErrorService } from '../core/services/error.service';

import { saveAs } from 'file-saver';
import { Pageable } from '../models/pageable';
import { MatSnackBar } from '@angular/material';

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
  resourceQuota$: Subject<ResourceQuota> = new Subject();

  promises: Promise<any>[] = [];

  newestResourceQuota: ResourceQuota;
  resourceQuotaName = 'GEOCODING';

  length = 0;

  successes = 0;

  constructor(
    private http: HttpClient,
    private rest: RestService,
    private resourceQuotaService: ResourceQuotaService,
    private errorService: ErrorService,
    private snackBar: MatSnackBar
  ) {
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

    this.successes = 0;

    this.getNewestResourceQuota();
  }

  getNewestResourceQuota() {
    this.resourceQuotaService.getNewest(this.resourceQuotaName).subscribe(
      (page: Pageable<ResourceQuota>) => {
        if (page.content.length) {
          this.newestResourceQuota = page.content[0];
          this.resourceQuota$.next(this.newestResourceQuota)
        } else {
          this.resourceQuotaService
            .createNewResourceQuota(this.resourceQuotaName)
            .subscribe((newRQ: ResourceQuota) => {
              this.newestResourceQuota = newRQ;
              this.resourceQuota$.next(this.newestResourceQuota)
            });
        }
      },
      err => {
        this.errorService.handleServerError(
          `Failed to retrieve geocoder quota information`,
          err,
          () => {
            // do nothing
          },
          () => {
            // do nothing
          }
        );
      }
    );
  }

  shouldGeocode() {
    if (this.newestResourceQuota) {
      const rqStart = new Date(this.newestResourceQuota.periodStartDate);
      const now = new Date();
      console.log(this.newestResourceQuota);
      if (rqStart.getMonth() < now.getMonth()) {
        // older than a month
        this.resourceQuotaService
          .createNewResourceQuota(this.resourceQuotaName)
          .subscribe((newRQ: ResourceQuota) => {
            this.newestResourceQuota = newRQ;
            this.resourceQuota$.next(this.newestResourceQuota)
          });
        return true;
      } else if (
        this.newestResourceQuota.queryCount + this.length <=
        this.newestResourceQuota.quotaLimit
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      this.errorService.handleServerError(
        `Failed to retrieve geocoder quota information`,
        null,
        () => {
          // do nothing
        },
        () => {
          // do nothing
        }
      );
    }
  }

  differenceInDays(firstDate, secondDate) {
    return Math.round((secondDate - firstDate) / (1000 * 60 * 60 * 24));
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
    curr = curr || 1; // current index in "set" (not a global index) -- used to make sure we arent exceeding limit/time API constraints
    const r = this.allRows[this.index].split(',').map(c => c.trim()); // current row

    // get address parts from cells using mapped indicies
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

    // combine address parts and encode for get request
    const requestURL = encodeURI(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${addressString
        .join(' ')
        .trim()}&key=AIzaSyBwCet-oRMj-K7mUhd0kcX_0U1BW-xpKyQ`
    );

    // put as many promises into an array as we can fit (limit)
    this.promises.push(this.getLatLong(requestURL));
    this.index++;
    if (this.index <= this.allowed) {
      if (curr < this.limit) {
        // keep looping until we hit the limit
        this.getURL(curr + 1);
      } else {
        // once we hit the limit, get all the promises
        this.getPromises();
      }
    } else {
      // if the global counter reaches the end of the file, get the rest of the promises and then save (true)
      this.getPromises(true);
    }
  }

  getPromises(save?: boolean) {
    Promise.all(this.promises).then((all: any) => {
      // this returns an array of promise responses
      all.forEach((res, i) => {
        // loop through the response array, get the lat/long data from each, append to csv string
        this.handleGeocodeData(res, i + 1);
      });
      // prep the promises array for the next set
      this.promises = [];
      if (save) {
        this.saveData();
      } else {
        // wait at least 1 second, then start building promises again
        setTimeout(() => {
          this.set++;
          this.getURL();
        }, 1250);
      }
    });
  }

  handleGeocodeData(data, index) {
    let text = '';
    // index factored against the global index accounting for the current set and the api speed quota limit
    const factoredIdx = index + (this.set * this.limit - this.limit);

    if (data.results.length && index <= this.allowed) {
      // geocode data
      const latitude = data.results[0].geometry.location.lat;
      const longitude = data.results[0].geometry.location.lng;
      const geotype = data.results[0].geometry.location_type;
      const matchedAddress = data.results[0].formatted_address.replace(
        /,/g,
        ' '
      );
      // for progress bar caption
      text = `Found ${matchedAddress} at ${latitude}/${longitude}`;

      // append the new data to the csv row string
      this.allRows[
        factoredIdx
      ] += `,${latitude},${longitude},${geotype},${matchedAddress}`;

      // tally of successful geocodes for updating the ResourceQuota object at the end
      this.successes++;
    } else {
      text = 'Failed to get data';
      this.allRows[factoredIdx] += `,,,,${text}`;
    }

    // update the progress bar
    this.progress$.next({
      done: factoredIdx,
      total: this.allowed,
      text: text
    });
  }

  getLatLong(url) {
    // the call object for the geocoder api (converted to a promise for batch simplicity)
    return this.http.get<any>(url).toPromise();
  }

  saveData = () => {
    // convert the csv string array --> string --> blob
    const blob = new Blob([this.allRows.join('\r\n')], {
      type: 'text/plain'
    });

    // save the blob as a file, and trigger browser download
    saveAs(blob, `${this.file.name.replace('.csv', '')}_geocoded.csv`);

    // observables for main component template
    this.running$.next(false);

    // update the ResourceQuota object on db to reflect queries
    this.updateResoureQuotaCount();
  };

  updateResoureQuotaCount() {
    this.newestResourceQuota.queryCount += this.successes;
    this.resourceQuotaService
      .update(this.newestResourceQuota)
      .subscribe((rq: ResourceQuota) => {
        this.snackBar.open(`Operation Complete`, null, { duration: 2000 });
      });
  }

  getAllRows(string) {
    // formats and breaks the file string into rows
    return string
      .trim()
      .split('\r\n')
      .map(r => r.trim())
      .filter(r => r);
  }

  getHeaderRowArray(file) {
    const allRows = this.getAllRows(file.fileOutput);
    return allRows[0].split(',').filter(r => r);
  }

  getRowLength(file) {
    const allRows = this.getAllRows(file.fileOutput);
    this.length = allRows.length - 1;
    return this.length;
  }

  handleFile(file, address, city, state, zip) {
    this.running$.next(true); // trigger the loading bar in the template

    this.file = file.file; // file data
    this.addressField = address; // input data
    this.cityField = city; // input data
    this.stateField = state; // input data
    this.zipField = zip; // input data

    this.allRows = this.getAllRows(file.fileOutput); // array of row strings
    this.allRows[0] += ',lat,lng,geotype,matched_address'; // extra fields for output
    this.allowed = this.allRows.length - 1; // exclude the header row
    this.headerRow = this.allRows[0];

    // indices for finding the associated cell
    this.addressIdx = this.addressField
      ? this.findField(this.addressField)
      : null;
    this.cityIdx = this.cityField ? this.findField(this.cityField) : null;
    this.stateIdx = this.stateField ? this.findField(this.stateField) : null;
    this.zipIdx = this.zipField ? this.findField(this.zipField) : null;

    this.getURL();
  }
}
