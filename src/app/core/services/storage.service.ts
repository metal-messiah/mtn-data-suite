import { Injectable } from '@angular/core';
import Cookies from 'js-cookie';
import { Observable, of } from 'rxjs';
import { getLocaleDayNames } from '@angular/common';

@Injectable()
export class StorageService {
	constructor() {}

	/////////// Cookies /////////////////////////////////////////

	setCookie(cookieName: string, data: any, days?: number, path?: string): Observable<any> {
		const options: any = {};
		if (days) {
			options.expires = days;
		}
		if (path !== null && typeof path !== 'undefined') {
			options.path = path;
		}
		console.log(`Setting Cookie For ${cookieName}`);
		Cookies.set(cookieName, data, options);
		return of(true);
	}

	getCookieAsJson(cookieName: string): Observable<object> {
		return of(Cookies.getJSON(cookieName));
	}

	getCookie(cookieName: string): Observable<string> {
		return of(Cookies.get(cookieName));
	}

	getAllCookies(): Observable<object> {
		return of(Cookies.get());
	}

	removeCookie(cookieName: string): Observable<any> {
		Cookies.remove(cookieName);
		return of(true);
	}

	//////////////////////////////////////////////////////////////
	/////////////// Local Storage ////////////////////////////////

	getLocalStorage(key: string, isJson: boolean): Observable<any> {
		return of(isJson ? JSON.parse(localStorage.getItem(key)) : localStorage.getItem(key));
	}

	setLocalStorage(key: string, data: any, isJson: true): Observable<any> {
		if (isJson) {
			localStorage.setItem(key, JSON.stringify(data));
		} else {
			localStorage.setItem(key, data);
		}
		return of(true);
	}

	removeLocalStorage(key: string): Observable<any> {
		localStorage.removeItem(key);
		return of(true);
	}
}
