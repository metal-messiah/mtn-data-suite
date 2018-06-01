import { Store } from './store';
import { Mappable } from '../interfaces/mappable';
import { SimplifiedStore } from './simplified-store';
import { UserProfile } from './user-profile';
import { Color } from '../core/functionalEnums/Color';
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { MarkerShape } from '../core/functionalEnums/MarkerShape';
import { Coordinates } from './coordinates';
import Icon = google.maps.Icon;
import Symbol = google.maps.Symbol;
import MarkerLabel = google.maps.MarkerLabel;

export class StoreMappable implements Mappable {

  id: number;
  private store: SimplifiedStore | Store;
  private currentUser: UserProfile;
  private selected = false;
  private moving = false;

  constructor(store: SimplifiedStore | Store, currentUser: UserProfile) {
    this.store = store;
    this.id = store.id;
    this.currentUser = currentUser;
  }

  getCoordinates(): Coordinates {
    return {lat: this.store.site.latitude, lng: this.store.site.longitude};
  };

  isDraggable(): boolean {
    return this.moving;
  }

  getLabel(markerType?: MarkerType): string|MarkerLabel {
    let label = null;
    if (this.store.banner != null) {
      label = this.store.banner.bannerName;
    } else {
      label = this.store.storeName;
    }
    if (markerType !== MarkerType.LOGO) {
      label = label[0];
    } else if (this.store.storeNumber != null) {
      label = `${label} (${this.store.storeNumber})`;
    }
    return {
      color: Color.WHITE,
      fontWeight: 'bold',
      text: label
    };
  }

  getIcon(markerType?: MarkerType): string | Icon | Symbol {
    if (markerType === MarkerType.LOGO) {
      return `http://res.cloudinary.com/mtn-retail-advisors/image/upload/r_0/${this.store.banner}`;
    }
    const fillColor = this.getFillColor();
    const strokeColor = this.getStrokeColor();
    const shape = this.getShape();
    const scale = this.getScale(shape);
    const anchor = this.getAnchor(shape);
    const strokeWeight = this.getStrokeWeight(shape);
    const fillOpacity = this.getFillOpacity(markerType);
    const rotation = this.getRotation();
    const labelOrigin = this.getLabelOrigin(shape, rotation);

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

  updateStore(store: SimplifiedStore | Store) {
    this.store = store;
  }

  getStore(): SimplifiedStore | Store {
    return this.store;
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
    if (this.store.site.assignee != null) {
      if (this.store.site.assignee.id === this.currentUser.id) {
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
    if (this.store.floating) {
      return MarkerShape.LIFE_RING;
    } else if (this.store.site.duplicate) {
      return MarkerShape.FLAGGED;
    }
    return MarkerShape.FILLED;
  }

  private getScale(shape: any) {
    if (shape === MarkerShape.LIFE_RING) {
      return 0.06;
    }
    return 0.075;
  }

  private getAnchor(shape: any) {
    const bottom = this.moving ? 750 : 510;
    if (shape === MarkerShape.FLAGGED) {
      return new google.maps.Point(80, bottom);
    }
    return new google.maps.Point(255, bottom);
  }

  private getStrokeWeight(shape: any) {
    if (shape === MarkerShape.LIFE_RING) {
      return 1.2;
    }
    return 2.5;
  }

  private getRotation() {
    // TODO Set Rotation for Future and Historical
    return 0;
  }

  private getLabelOrigin(shape: any, rotation: any) {
    if (shape === MarkerShape.FLAGGED) {
      new google.maps.Point(255, 220);
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
