import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

import * as localforage from 'localforage';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class StorageService {
  storage: any;

  constructor() {
    this.storage = localforage;
    // tries IndexedDB, if that fails tries WebSQL, if that fails falls back to localStorage
    this.storage.setDriver([localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE]);
  }

  set(key, value): Observable<any> {
    return from(this.storage.setItem(key, value));
  }

  getOne(key): Observable<any> {
    return from(this.storage.getItem(key));
  }

  removeOne(key): Observable<any> {
    return from(this.storage.removeItem(key));
  }

  removeAll(): Observable<any> {
    return from(this.storage.clear());
  }

  export(key: string, isJson: boolean, fileName?: string, child?: string): void {
    this.getOne(key).subscribe((item) => {
      let obj = child ? item[child] : item;
      const name = fileName ? fileName : obj.name ? obj.name : 'storage_item';
      if (isJson) {
        obj = JSON.stringify(obj);
      }
      saveAs(new Blob([obj]), `${name}.json`);
    });
  }

  import(key: string, data: any, isJson: boolean, child?: any): Observable<void> {
    if (child && isJson) {
      return this.getOne(key).pipe(mergeMap((item) => {
        item[child] = data;
        return this.set(key, item);
      }));
    } else {
      return this.set(key, data);
    }
  }
}
