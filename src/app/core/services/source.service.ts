import { Injectable } from '@angular/core';

@Injectable()
export class SourceService {
  dummyData: object[];
  dummyDB: object[];

  constructor() {
    this.dummyData = [
      {
        OBJECTID: 15,
        source_store_name: 'Walmart Neighborhood',
        source_address: 'Bluffton Parkway and Highway S.C. 170',
        validated: false
      },
      {
        OBJECTID: 16,
        source_store_name: 'Walmart Neighborhood',
        source_address: '1355 Knox-Abbott Drive',
        validated: false
      },
      {
        OBJECTID: 17,
        source_store_name: 'Walmart Neighborhood',
        source_address: '3901 N Kings Highway',
        validated: false
      },
      {
        OBJECTID: 18,
        source_store_name: 'Walmart Neighborhood',
        source_address: '17th Avenue South and South King Highway',
        validated: false
      },
      {
        OBJECTID: 19,
        source_store_name: 'Walmart Supercenter',
        source_address: 'Intersection of Sea Island Parkway and Airport Circle',
        validated: false
      }
    ];

    this.dummyDB = [
      {
        address: '123 Fake Street',
        city: 'Layton',
        state: 'UT',
        zip: 84000,
        stores: [
          {
            OBJECTID: 15,
            store_name: 'Harmons',
            store_number: 10,
            status: 'Open',
            status_date: '3/2018'
          },
          {
            OBJECTID: 20,
            store_name: 'Smith\'s',
            store_number: 9874,
            status: 'Closed',
            status_date: '11/2017'
          }
        ]
      },
      {
        address: '4564 Canyon Avenue',
        city: 'Layton',
        state: 'UT',
        zip: 84000,
        stores: [
          {
            OBJECTID: 12436,
            store_name: 'Albertsons',
            store_number: 56,
            status: 'Open',
            status_date: '3/2018'
          }
        ]
      }
    ];
  }

  getSourceTable() {
    return this.dummyData;
  }

  getDBTable() {
    return this.dummyDB;
  }
}
