import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class RestService {

  private accessToken: string;
  private headers: HttpHeaders;

  constructor() {
  }

  public getHost(): string {
    return environment.WEB_SERVICE_HOST;
  }

  public getReportHost(): string {
    return environment.REPORT_HOST;
  }

  public getNodeReportHost(): string {
    return environment.NODE_REPORT_HOST;
  }

  public getHeaders(): HttpHeaders {
    return this.headers;
  }

  setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    });
  }

  getAccessToken() {
    return this.accessToken;
  }

}
