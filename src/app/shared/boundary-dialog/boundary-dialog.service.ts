import { Injectable } from '@angular/core';
import { BoundaryService } from 'app/core/services/boundary.service';
import { Boundary } from 'app/models/full/boundary';
import { StorageService } from 'app/core/services/storage.service';
import { GeometryUtil } from '../../utils/geometry-util';

import * as _ from 'lodash';
import { DbEntityMarkerService } from 'app/core/services/db-entity-marker.service';
import { ProjectBoundary } from 'app/models/project-boundary';

enum BoundaryColor {
  RED = '#FF0000',
  BLUE = '#0000FF',
  GREEN = '#00FF00'
}

@Injectable({
  providedIn: 'root'
})
export class BoundaryDialogService {
  private _projectBoundaries: Boundary[];
  private _geoPoliticalBoundaries: Boundary[];
  private _customBoundaries: Boundary[];

  private enabledBoundariesStorageKey = 'enabledBoundaries';
  private customBoundariesStorageKey = 'customBoundaries';

  private _enabledProjectBoundaries: Boundary[] = [];
  private _enabledGeoPoliticalBoundaries: Boundary[] = [];
  private _enabledCustomBoundaries: Boundary[] = [];

  private gmap: google.maps.Map;
  private polygons = [];

  constructor(private boundaryService: BoundaryService, private storageService: StorageService) {
    console.log('BOUNDARY DIALOG SERVICE CONSTRUCTOR!')
    this._projectBoundaries = [new Boundary({ name: 'Project Boundary 1' }), new Boundary({ name: 'Project Boundary 2' })];
    this._geoPoliticalBoundaries = [new Boundary({ name: 'Geo Boundary 1' }), new Boundary({ name: 'Geo Boundary 2' })];

    this.initCustomBoundaries();
    this.checkEnabledBoundaries();
  }

  // REMOVE THIS WHEN REAL DATA IS READY
  private async dummyData() {
    const dummyBoundaries: Boundary[] = [new Boundary({
      name: 'Custom Boundary 1', geojson: {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'properties': {},
            'geometry': {
              'type': 'Polygon',
              'coordinates': [
                [
                  [
                    -105.908203125,
                    41.36031866306708
                  ],
                  [
                    -105.1171875,
                    38.685509760012
                  ],
                  [
                    -101.05224609374999,
                    39.53793974517628
                  ],
                  [
                    -100.7666015625,
                    43.13306116240612
                  ],
                  [
                    -103.84277343749999,
                    44.22945656830167
                  ],
                  [
                    -105.908203125,
                    41.36031866306708
                  ]
                ]
              ]
            }
          }
        ]
      }
    }), new Boundary({
      name: 'Custom Boundary 2', geojson: {
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature', 'geometry': {
            'type': 'Polygon', 'coordinates': [
              [[-75.77545166015625, 39.71986348549764], [-76.06109619140625, 39.71775084250469], [-76.0528564453125, 40.002371935876475], [-75.93475341796875, 40.24179856487036], [-75.6298828125, 40.39258071969132], [-75.4156494140625, 40.549287249082035], [-75.33050537109375, 40.59518511581991], [-75.069580078125, 40.534676780615406], [-74.794921875, 40.4490371952376], [-74.69329833984375, 40.2711436860842], [-74.696044921875, 40.130591063801795], [-74.77054595947266, 40.12849105685408], [-74.77981567382812, 40.12192811696267], [-74.81964111328125, 40.128753561270784], [-74.83783721923828, 40.10065983986402], [-74.85740661621094, 40.0909424881834], [-74.86427307128906, 40.08174912168242], [-74.91508483886719, 40.06992725476079], [-74.9264144897461, 40.07045271464658], [-75.13069152832031, 39.95817509460007], [-75.13343811035156, 39.88866516883712], [-75.333251953125, 39.84755795735592], [-75.41221618652344, 39.803261109668945], [-75.45744895935059, 39.82158975719268], [-75.50405502319336, 39.834640993641], [-75.5595874786377, 39.83872723469325], [-75.62061309814453, 39.832268225979405], [-75.67099571228027, 39.81868914572431], [-75.72137832641602, 39.79139103352653], [-75.75528144836426, 39.75722016211178], [-75.77545166015625, 39.71986348549764]]]
          }, 'properties': {}
        }]
      }
    }), ]
    await this.storageService.set(this.customBoundariesStorageKey, dummyBoundaries).toPromise();
    console.log('set customs dummy data!');

    await this.storageService.set(this.enabledBoundariesStorageKey, dummyBoundaries).toPromise();
    console.log('set enabled dummy data!');

    this._customBoundaries = dummyBoundaries;
    this._enabledCustomBoundaries = this._customBoundaries;
  }

  private geojsonStringToPolygon(inputGeojson: any): any {
    let geojson: any;
    if (typeof inputGeojson === 'string') {
      geojson = JSON.parse(inputGeojson);
    } else {
      geojson = inputGeojson;
    }
    return geojson
  }

  private stylePolygon(color: BoundaryColor, boundary: ProjectBoundary) {
    boundary.polygons.forEach(p => {
      p.setOptions({
        strokeColor: '#000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.15
      })
    })
  }

  private clearEnabledBoundaries() {
    // this.polygons.forEach(poly => poly.set('map', null))
  }

  private showEnabledBoundaries() {
    console.log('show enabled boundaries');
    this.clearEnabledBoundaries();
    this.polygons = Object.assign(
      [],
      this._enabledCustomBoundaries.map(boundary => {
        return this.stylePolygon(
          BoundaryColor.RED,
          new ProjectBoundary(this.gmap, this.geojsonStringToPolygon(boundary.geojson))
        )
      }),
      this._enabledGeoPoliticalBoundaries.map(boundary => {
        return this.stylePolygon(
          BoundaryColor.BLUE,
          new ProjectBoundary(this.gmap, this.geojsonStringToPolygon(boundary.geojson))
        )
      }),
      this._enabledProjectBoundaries.map(boundary => {
        return this.stylePolygon(
          BoundaryColor.GREEN,
          new ProjectBoundary(this.gmap, this.geojsonStringToPolygon(boundary.geojson))
        )
      })
    );

  }

  private async checkEnabledBoundaries() {
    const enabledBoundaries = await this.storageService.getOne(this.enabledBoundariesStorageKey).toPromise();
    if (enabledBoundaries) { this._enabledCustomBoundaries = enabledBoundaries } else { this.dummyData() };
  }

  private async initCustomBoundaries() {
    const boundaries = await this.storageService.getOne(this.customBoundariesStorageKey).toPromise();
    if (boundaries) {
      this._customBoundaries = boundaries;
    } else {
      console.log('No boundaries');
      this.dummyData();
    }
  }

  setMap(gmap: google.maps.Map) {
    this.gmap = gmap;
  }

  setEnabledProjectBoundaries(data) {
    this._enabledProjectBoundaries = data;
    this.showEnabledBoundaries();
  }

  setEnabledGeoPoliticalBoundaries(data) {
    this._enabledGeoPoliticalBoundaries = data;
    this.showEnabledBoundaries();
  }

  setEnabledCustomBoundaries(data) {
    this._enabledCustomBoundaries = data;
    this.showEnabledBoundaries();
  }

  get enabledProjectBoundaries(): Boundary[] {
    return this._enabledProjectBoundaries
  }

  get enabledGeoPoliticalBoundaries(): Boundary[] {
    return this._enabledGeoPoliticalBoundaries
  }

  get enabledCustomBoundaries(): Boundary[] {
    return this._enabledCustomBoundaries
  }

  get projectBoundaries(): Boundary[] {
    return this._projectBoundaries;
  }

  get geoPoliticalBoundaries(): Boundary[] {
    return this._geoPoliticalBoundaries;
  }

  get customBoundaries(): Boundary[] {
    return this._customBoundaries;
  }
}
