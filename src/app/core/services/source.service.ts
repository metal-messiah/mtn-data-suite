import { Injectable } from '@angular/core';

@Injectable()
export class SourceService {

  dummyData: object[]
  constructor() {
   
    this.dummyData = [
      {
        OBJECTID: 15,
        source_store_name: "Walmart Neighborhood",
        source_address: "Bluffton Parkway and Highway S.C. 170",
        validated: false
      },{
        OBJECTID: 16,
        source_store_name: "Walmart Neighborhood",
        source_address: "1355 Knox-Abbott Drive",
        validated: false
      },{
        OBJECTID: 17,
        source_store_name: "Walmart Neighborhood",
        source_address: "3901 N Kings Highway",
        validated: false
      },{
        OBJECTID: 18,
        source_store_name: "Walmart Neighborhood",
        source_address: "17th Avenue South and South King Highway",
        validated: false
      },{
        OBJECTID: 19,
        source_store_name: "Walmart Supercenter",
        source_address: "Intersection of Sea Island Parkway and Airport Circle",
        validated: false
      },
    ]
  }

  getSourceTable(){
    return this.dummyData;
  }
}