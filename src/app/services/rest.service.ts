import {Injectable} from '@angular/core';
import {HttpHeaders} from '@angular/common/http';

@Injectable()
export class RestService {

  private host = 'http://localhost:8080';
  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
  });

  constructor() {
  }

  public getHost(): string {
    return this.host;
  }

  public getHeaders(): HttpHeaders {
    return this.headers;
  }

}
