import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable()
export class PlannedGroceryService {

  http: HttpClient;

  constructor(http: HttpClient) {
      this.http = http;
   }

   get(url){
    return this.http.get(url)
    
   }

}
