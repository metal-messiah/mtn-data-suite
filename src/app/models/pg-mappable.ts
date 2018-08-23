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
  private draggable: boolean;
  private defaultIcon: object = {
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
  private icon: object;

  constructor(feature: any) {
    this.feature = feature;
    this.id = feature.attributes.OBJECTID;
    this.coordinates = { lat: feature.geometry.y, lng: feature.geometry.x };
    this.draggable = false;
    this.icon = Object.assign({}, this.defaultIcon);
  }

  getCoordinates(): Coordinates {
    return this.coordinates;
  };

  setDraggable(draggable) {
    this.draggable = draggable;
    this.icon = draggable ? {
      path: MarkerShape.FILLED,
      fillColor: Color.PURPLE_DARK,
      fillOpacity: 1,
      scale: 0.1,
      strokeColor: Color.WHITE,
      strokeWeight: 2.5,
      anchor: new google.maps.Point(255, 510),
      labelOrigin: new google.maps.Point(255, 230),
      rotation: 0
    } :
      Object.assign({}, this.defaultIcon);
  }

  isDraggable(): boolean {
    return this.draggable;
  }

  getLabel(zoom: number, markerType?: MarkerType): string | MarkerLabel {
    return null;
  }

  getIcon(zoom: number, markerType?: MarkerType): string | Icon | Symbol {
    return this.icon
  }

}
