import { Color } from '../core/functionalEnums/Color';
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { MarkerShape } from '../core/functionalEnums/MarkerShape';
import { Coordinates } from './coordinates';
import Icon = google.maps.Icon;
import Symbol = google.maps.Symbol;
import MarkerLabel = google.maps.MarkerLabel;
import { Mappable } from '../interfaces/mappable';

export class PgMappable implements Mappable {

  public id: string;
  private feature: any;
  private readonly coordinates: Coordinates;

  constructor(feature: any) {
    this.feature = feature;
    this.id = feature.attributes.OBJECTID;
    this.coordinates = {lat: feature.geometry.y, lng: feature.geometry.x};
  }

  getCoordinates(): Coordinates {
    return this.coordinates;
  };

  isDraggable(): boolean {
    return false;
  }

  getLabel(zoom: number, markerType?: MarkerType): string|MarkerLabel {
    return null;
  }

  getIcon(zoom: number, markerType?: MarkerType): string | Icon | Symbol {
    return {
      path: MarkerShape.CIRCLE,
      fillColor: Color.PURPLE,
      fillOpacity: 0.5,
      scale: 0.5,
      strokeColor: Color.PURPLE_DARK,
      strokeWeight: 2.5,
      anchor: new google.maps.Point(50, 50),
      labelOrigin: new google.maps.Point(255, 230),
      rotation: 0
    };
  }
}
