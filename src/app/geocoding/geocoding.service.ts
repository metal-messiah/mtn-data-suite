import { HttpClient } from '@angular/common/http';
import { RestService } from '../core/services/rest.service';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ResourceQuota } from '../models/resource-quota';
import { ResourceQuotaService } from '../core/services/resource-quota.service';
import { ErrorService } from '../core/services/error.service';

import { saveAs } from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class GeocodingService {
  allowed: number;
  file: File;

  address: string;
  city: string;
  state: string;
  zip: string;

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
  progress$: Subject<object> = new Subject();
  resourceQuota$: Subject<ResourceQuota> = new Subject();

  promises: Promise<any>[] = [];

  newestResourceQuota: ResourceQuota;
  resourceQuotaName = 'GEOCODING';

  length = 0;

  successes = 0;
  failures = 0;
  rooftops = 0;

  constructor(
    private http: HttpClient,
    private rest: RestService,
    private resourceQuotaService: ResourceQuotaService,
    private errorService: ErrorService,
    private snackBar: MatSnackBar
  ) {
    this.reset();
  }

  private reset() {
    this.index = 1;
    this.allowed = null;
    this.file = null;
    this.address = null;
    this.city = null;
    this.state = null;
    this.zip = null;

    this.addressIdx = null;
    this.cityIdx = null;
    this.stateIdx = null;
    this.zipIdx = null;

    this.headerRow = null;
    this.allRows = null;

    this.set = 1;

    this.successes = 0;
    this.failures = 0;
    this.rooftops = 0;

    this.getNewestResourceQuota();
  }

  getNewestResourceQuota() {
    this.resourceQuotaService.getNewest(this.resourceQuotaName)
      .subscribe(
        (quota: ResourceQuota) => {
          this.newestResourceQuota = quota;
          this.resourceQuota$.next(this.newestResourceQuota);
          this.snackBar.open(
            `${(
              this.newestResourceQuota.quotaLimit -
              this.newestResourceQuota.queryCount
            ).toLocaleString()} Geocodes Remaining This Month`,
            null,
            {
              duration: 2000
            }
          );
        },
        err => {
          if (err.status === 404) {
            this.resourceQuotaService
              .createNewResourceQuota(this.resourceQuotaName)
              .subscribe((newRQ: ResourceQuota) => {
                this.newestResourceQuota = newRQ;
                this.resourceQuota$.next(this.newestResourceQuota);
                this.snackBar.open(
                  `${(
                    this.newestResourceQuota.quotaLimit -
                    this.newestResourceQuota.queryCount
                  ).toLocaleString()} Geocodes Remaining This Month`,
                  null,
                  {
                    duration: 2000
                  }
                );
              });
          } else {
            this.errorService.handleServerError(`Failed to retrieve geocoder quota information`, err, () => {
            });
          }
        }
      );
  }

  shouldGeocode() {
    if (this.newestResourceQuota) {
      const rqStart = new Date(this.newestResourceQuota.periodStartDate);
      const now = new Date();
      if (
        rqStart.getMonth() < now.getMonth() ||
        rqStart.getFullYear() < now.getFullYear()
      ) {
        // the NEWEST RQ is over a month old --> time to make a new resource quota
        this.resourceQuotaService
          .createNewResourceQuota(this.resourceQuotaName)
          .subscribe((newRQ: ResourceQuota) => {
            // assign the newly created RQ and let the app know
            this.newestResourceQuota = newRQ;
            this.resourceQuota$.next(this.newestResourceQuota);
          });
        return this.length <= 20000;
      } else {
        return (this.newestResourceQuota.queryCount + this.length) <= this.newestResourceQuota.quotaLimit;
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

  findField(field: string, headerRow?: string) {
    const hr = this.headerRow ? this.headerRow : headerRow;
    if (field && hr) {
      const idx = hr
        .split(',')
        .map(c => c.trim())
        .findIndex(f => f.toLowerCase() === field.toLowerCase());
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
        this.finalize();
      } else {
        // wait at least 1 second (dont exceed 50/sec), then start building promises again
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

      // append the new data to the csv row string
      this.allRows[
        factoredIdx
        ] += `,${latitude},${longitude},${geotype},${matchedAddress}`;

      // tally of successful geocodes for status bar / updating the ResourceQuota object at the end
      this.successes++;
      if (geotype === 'ROOFTOP') {
        this.rooftops++;
      }
    } else {
      text = 'Failed to get data';
      this.allRows[factoredIdx] += `,,,,${text}`;
      // tally of failures for status bar
      this.failures++;
    }

    // update the status bar
    this.progress$.next({
      done: factoredIdx,
      total: this.allowed,
      successes: this.successes,
      failures: this.failures,
      rooftops: this.rooftops
    });
  }

  getLatLong(url) {
    if (
      url ===
      'https://maps.googleapis.com/maps/api/geocode/json?address=&key=AIzaSyBwCet-oRMj-K7mUhd0kcX_0U1BW-xpKyQ'
    ) {
      this.errorService.handleServerError(
        `A Row In The File Is Creating an Invalid Request`,
        url,
        () => {
          // do nothing
        }
      );
    }
    // the call object for the geocoder api (converted to a promise for batch simplicity)
    return this.http.get<any>(url).toPromise();
  }

  finalize() {
    // observables for main component template -- shows/hides loading info
    // wait 5 seconds just so that there is time to read the status bar before it hides
    setTimeout(() => {
      this.running$.next(false);
      this.saveData();
    }, 5000);

    // update the ResourceQuota object on db to reflect queries
    this.updateResoureQuotaCount();
  }

  saveData() {
    // convert the csv string array --> string --> blob
    const blob = new Blob([this.allRows.join('\r\n')], {
      type: 'text/plain'
    });

    // save the blob as a file, and trigger browser download
    saveAs(blob, `${this.file.name.replace('.csv', '')}_geocoded.csv`);

    this.reset();
  }

  updateResoureQuotaCount() {
    this.newestResourceQuota.queryCount += this.successes;
    this.resourceQuotaService
      .update(this.newestResourceQuota)
      .subscribe((rq: ResourceQuota) => {
        this.snackBar.open(`Geocoding Complete -- Compiling File`, null, {
          duration: 2000
        });
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

  getQueryStringPreview(file, address, city, state, zip) {
    const allRows = this.getAllRows(file.fileOutput);
    const headerRow = allRows[0];
    // indices for finding the associated cell
    const addressIdx = address
      ? this.findField(address, headerRow)
      : null;
    const cityIdx = city ? this.findField(city, headerRow) : null;
    const stateIdx = state ? this.findField(state, headerRow) : null;
    const zipIdx = zip ? this.findField(zip, headerRow) : null;

    const r = allRows[1].split(',').map(c => c.trim()); // current row

    // get address parts from cells using mapped indices
    const addressString = [];
    if (addressIdx) {
      addressString.push(this.formatWebString(r[addressIdx]));
    }
    if (cityIdx) {
      addressString.push(this.formatWebString(r[cityIdx]));
    }
    if (stateIdx) {
      addressString.push(this.formatWebString(r[stateIdx]));
    }
    if (zipIdx) {
      addressString.push(this.formatWebString(r[zipIdx]));
    }

    return addressString.join(', ');
  }

  handleFile(file, address, city, state, zip) {
    this.running$.next(true); // trigger the loading bar in the template

    this.file = file.file; // file data
    this.address = address; // input data
    this.city = city; // input data
    this.state = state; // input data
    this.zip = zip; // input data

    this.allRows = this.getAllRows(file.fileOutput); // array of row strings
    this.allRows[0] += ',lat,lng,geotype,matched_address'; // extra fields for output
    this.allowed = this.allRows.length - 1; // exclude the header row
    this.headerRow = this.allRows[0];

    // indices for finding the associated cell
    this.addressIdx = this.address
      ? this.findField(this.address)
      : null;
    this.cityIdx = this.city ? this.findField(this.city) : null;
    this.stateIdx = this.state ? this.findField(this.state) : null;
    this.zipIdx = this.zip ? this.findField(this.zip) : null;

    this.getURL();
  }
}
