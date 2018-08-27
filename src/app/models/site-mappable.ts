import { Color } from '../core/functionalEnums/Color';
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { MarkerShape } from '../core/functionalEnums/MarkerShape';
import { Coordinates } from './coordinates';
import Icon = google.maps.Icon;
import Symbol = google.maps.Symbol;
import MarkerLabel = google.maps.MarkerLabel;
import { SimplifiedSite } from './simplified/simplified-site';
import { EntityMappable } from '../interfaces/entity-mappable';

export class SiteMappable implements EntityMappable {

  id: number;
  private site: SimplifiedSite;
  private readonly currentUserId: number;
  private selected = false;
  private moving = false;

  constructor(site: SimplifiedSite, currentUserId: number) {
    this.site = site;
    this.id = site.id;
    this.currentUserId = currentUserId;
  }

  getCoordinates(): Coordinates {
    return {lat: this.site.latitude, lng: this.site.longitude};
  };

  isDraggable(): boolean {
    return this.moving;
  }

  getLabel(markerType?: MarkerType): string | MarkerLabel {
    return {
      color: Color.WHITE,
      fontWeight: 'bold',
      text: ' '
    };
  }

  getIcon(markerType?: MarkerType): string | Icon | Symbol {
    const fillColor = this.getFillColor();
    const strokeColor = this.getStrokeColor();
    const shape = this.getShape();
    const scale = 0.075;
    const anchor = this.getAnchor(shape);
    const strokeWeight = 2.5;
    const fillOpacity = this.getFillOpacity(markerType);
    const rotation = 0;
    const labelOrigin = this.getLabelOrigin(shape);

    return {
      path: shape,
      fillColor: fillColor,
      fillOpacity: fillOpacity,
      scale: scale,
      strokeColor: strokeColor,
      strokeWeight: strokeWeight,
      anchor: anchor,
      labelOrigin: labelOrigin,
      rotation: rotation
    };
  }

  updateEntity(site: SimplifiedSite) {
    this.site = site;
  }

  getEntity(): SimplifiedSite {
    return this.site;
  }

  setSelected(selected: boolean) {
    this.selected = selected;
  }

  setMoving(moving: boolean) {
    this.moving = moving;
  }

  private getFillColor() {
    if (this.moving) {
      return Color.PURPLE;
    }
    if (this.site.assignee != null) {
      if (this.site.assignee.id === this.currentUserId) {
        if (this.selected) {
          return Color.GREEN_DARK;
        } else {
          return Color.GREEN;
        }
      } else {
        if (this.selected) {
          return Color.RED_DARK;
        } else {
          return Color.RED;
        }
      }
    }
    if (this.selected) {
      return Color.BLUE_DARK;
    } else {
      return Color.BLUE;
    }
  }

  private getStrokeColor() {
    if (this.moving) {
      return Color.PURPLE_DARK;
    }
    return this.selected ? Color.YELLOW : Color.WHITE;
  }

  private getShape() {
    if (this.site.duplicate) {
      return MarkerShape.FLAGGED;
    }
    return MarkerShape.DEFAULT;
  }

  private getAnchor(shape: any) {
    const bottom = 510;
    if (shape === MarkerShape.FLAGGED) {
      return new google.maps.Point(80, bottom);
    }
    return new google.maps.Point(255, bottom);
  }

  private getLabelOrigin(shape: any) {
    if (shape === MarkerShape.FLAGGED) {
      return new google.maps.Point(255, 220);
    }
    return new google.maps.Point(255, 230);
  }

  private getFillOpacity(markerType?: MarkerType) {
    if (markerType === MarkerType.LABEL) {
      return 0.6;
    }
    return 1;
  }

}
