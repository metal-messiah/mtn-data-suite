import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

import * as localforage from 'localforage';

@Injectable()
export class StorageService {
	storage: any;

	constructor() {
		this.storage = localforage;
		// tries IndexedDB, if that fails tries WebSQL, if that fails fallsback to localStorage
		this.storage.setDriver([ localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE ]);
	}

	set(key, value): Promise<any> {
		return this.storage.setItem(key, value);
	}

	getOne(key): Promise<any> {
		return this.storage.getItem(key);
	}

	getAll(): Promise<any> {
		return this.storage.iterate();
	}

	removeOne(key): Promise<any> {
		return this.storage.removeItem(key);
	}

	removeAll(): Promise<any> {
		return this.storage.clear();
	}

	export(key: string, isJson: boolean, child?: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.getOne(key).then(
				(item) => {
					try {
						let obj = child ? item[child] : item;
						const name = obj.name ? obj.name : 'storage_item';
						if (isJson) {
							obj = JSON.stringify(obj);
						}
						saveAs(new Blob([ obj ]), `${name}.json`);
						return resolve(true);
					} catch (err) {
						return reject(err);
					}
				},
				(err) => reject(err)
			);
		});
	}

	import(key: string, data: any, isJson: boolean, child?: any): Promise<any> {
		return new Promise((resolve, reject) => {
			try {
				if (child && isJson) {
					this.getOne(key).then((item) => {
						item[child] = data;
						this.set(key, item).then(
							(success) => {
								return resolve(success);
							},
							(err) => reject(err)
						);
					});
				} else {
					this.set(key, data).then(
						(success) => {
							return resolve(success);
						},
						(err) => reject(err)
					);
				}
			} catch (err) {
				return reject(err);
			}
		});
	}
}
