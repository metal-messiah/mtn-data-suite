import { Injectable } from '@angular/core';
import { Color } from '../enums/Color';
import { MarkerPath } from '../enums/MarkerPath';

@Injectable()
export class IconService {

  constructor() {
  }

  getIcon(fillColor: Color | string, strokeColor: Color | string, symbolPath: MarkerPath | google.maps.SymbolPath, rotation?: number) {
    if (symbolPath === MarkerPath.FILLED || symbolPath === MarkerPath.DEFAULT) {
      return {
        path: symbolPath,
        fillColor: fillColor,
        fillOpacity: 1,
        scale: 0.075,
        strokeColor: strokeColor,
        strokeWeight: 2.5,
        anchor: new google.maps.Point(255, 510),
        labelOrigin: new google.maps.Point(255, 200),
        rotation: rotation != null ? rotation : 0
      };
    }

    return {
      path: symbolPath,
      fillColor: fillColor,
      fillOpacity: 0.7,
      scale: 7,
      strokeColor: strokeColor,
      strokeWeight: 2.5,
      labelOrigin: new google.maps.Point(0, -2),
      rotation: rotation != null ? rotation : 0
    };
  }

}
