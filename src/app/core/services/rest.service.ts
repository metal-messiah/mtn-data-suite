import {Injectable} from '@angular/core';
import {HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable()
export class RestService {

  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
  });

  constructor() {
  }

  public getHost(): string {
    return environment.WEB_SERVICE_HOST;
  }

  public getHeaders(): HttpHeaders {
    return this.headers;
  }

}
