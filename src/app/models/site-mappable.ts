import { Color } from '../core/functionalEnums/Color';
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { MarkerShape } from '../core/functionalEnums/MarkerShape';
import { LatLng } from './latLng';
import Icon = google.maps.Icon;
import Symbol = google.maps.Symbol;
import MarkerLabel = google.maps.MarkerLabel;
import { SimplifiedSite } from './simplified/simplified-site';
import { EntityMappable } from '../interfaces/entity-mappable';

export class SiteMappable implements EntityMappable {

  private site: SimplifiedSite;
  private moving = false;

  private readonly sessionUserId: number;
  private readonly isSelected: (Entity) => boolean;

  constructor(site: SimplifiedSite, currentUserId: number, isSelected: (Entity) => boolean) {
    this.site = site;
    this.sessionUserId = currentUserId;
    this.isSelected = isSelected;
  }

  getCoordinates(): LatLng {
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
    const selected = this.isSelected(this.getEntity());

    const fillColor = this.getFillColor(selected);
    const strokeColor = this.getStrokeColor(selected);
    const shape = this.getShape();
    const scale = 0.075;
    const anchor = this.getAnchor(shape);
    const strokeWeight = 2.5;
    const fillOpacity = 1;
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

  setMoving(moving: boolean) {
    this.moving = moving;
  }

  private getFillColor(selected: boolean) {
    if (this.moving) {
      return Color.PURPLE;
    }
    if (this.site.assignee != null) {
      if (this.site.assignee.id === this.sessionUserId) {
        if (selected) {
          return Color.GREEN_DARK;
        } else {
          return Color.GREEN;
        }
      } else {
        if (selected) {
          return Color.RED_DARK;
        } else {
          return Color.RED;
        }
      }
    }
    if (selected) {
      return Color.BLUE_DARK;
    } else {
      return Color.BLUE;
    }
  }

  private getStrokeColor(selected: boolean) {
    if (this.moving) {
      return Color.PURPLE_DARK;
    }
    return selected ? Color.YELLOW : Color.WHITE;
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

}
