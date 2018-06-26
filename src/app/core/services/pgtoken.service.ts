

import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable()
export class PGTokenService {

  http: HttpClient;
  tokenURL: string = "https://www.arcgis.com/sharing/rest/oauth2/token/?client_id=LT6WmxqA9lqbrGOR&client_secret=ca783148e98d45f29798a9d1ec1f75e1&grant_type=client_credentials&expiration=20160";

  constructor(http: HttpClient) {
      this.http = http;
   }

   getToken(){
     console.log("GET TOKEN!")
    return this.http.get(this.tokenURL)
    
   }

}
