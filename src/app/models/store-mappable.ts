import { SimplifiedStore } from './simplified/simplified-store';
import { Color } from '../core/functionalEnums/Color';
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { MarkerShape } from '../core/functionalEnums/MarkerShape';
import { Coordinates } from './coordinates';
import { EntityMappable } from '../interfaces/entity-mappable';
import Icon = google.maps.Icon;
import Symbol = google.maps.Symbol;
import MarkerLabel = google.maps.MarkerLabel;

export class StoreMappable implements EntityMappable {

  id: number;
  private readonly currentUserId: number;
  private readonly getSelectedProjectId: () => number;

  private store: SimplifiedStore;
  private selected = false;
  private moving = false;

  private readonly HIGH_ZOOM = 13;
  private readonly MID_ZOOM = 16;

  private readonly map: google.maps.Map;

  constructor(store: SimplifiedStore, currentUserId: number, map: google.maps.Map, getSelectedProjectId?: () => number) {
    this.store = store;
    this.id = store.id;
    this.currentUserId = currentUserId;
    this.getSelectedProjectId = getSelectedProjectId;
    this.map = map;
  }

  getCoordinates(): Coordinates {
    return {lat: this.store.site.latitude, lng: this.store.site.longitude};
  };

  isDraggable(): boolean {
    return this.moving;
  }

  getLabel(markerType?: MarkerType): string|MarkerLabel {
    const zoom = this.map.getZoom();
    let labelColor = Color.WHITE;

    if (this.storeCasedForSelectedProject()) {
      return null;
    } else if (markerType === MarkerType.LOGO && this.store.banner != null && this.store.banner.logoFileName != null) {
      return null;
    }

    let label = null;

    // User Banner name if available
    if (this.store.banner) {
      label = this.store.banner.bannerName;
    } else if (this.store.storeName) {
      label = this.store.storeName;
    } else {
      label = '?';
    }

    // At High Zoom, show full label
    if (zoom > this.HIGH_ZOOM) {
      const mapTypeId = this.map.getMapTypeId();
      if (mapTypeId === google.maps.MapTypeId.SATELLITE || mapTypeId === google.maps.MapTypeId.HYBRID) {
        labelColor = Color.WHITE;
      } else {
        labelColor = Color.BLACK;
      }
    } else {
      labelColor = Color.WHITE;
      label = label[0];
    }

    return {
      color: labelColor,
      text: zoom > this.MID_ZOOM ? label[0] : label
    };
  }

  getIcon(markerType?: MarkerType): string | Icon | Symbol {
    if (markerType === MarkerType.LOGO && this.store.banner != null && this.store.banner.logoFileName != null) {
      return {
        url: `https://res.cloudinary.com/mtn-retail-advisors/image/upload/c_limit,h_20/${this.store.banner.logoFileName}`
      }
    }
    const fillColor = this.getFillColor();
    const strokeColor = this.getStrokeColor();
    const shape = this.getShape();
    const scale = this.getScale(shape);
    const anchor = this.getAnchor(shape);
    const strokeWeight = this.getStrokeWeight(shape);
    const fillOpacity = StoreMappable.getFillOpacity(markerType);
    const rotation = this.getRotation();
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

  updateEntity(store: SimplifiedStore) {
    this.store = store;
  }

  getEntity(): SimplifiedStore {
    return this.store;
  }

  setSelected(selected: boolean) {
    this.selected = selected;
  }

  setMoving(moving: boolean) {
    this.moving = moving;
  }

  private storeCasedForSelectedProject() {
    return this.getSelectedProjectId &&
      this.getSelectedProjectId() != null &&
      this.store.projectIds != null &&
      this.store.projectIds.indexOf(this.getSelectedProjectId()) !== -1
  }

  private getFillColor() {
    if (this.moving) {
      return Color.PURPLE;
    }
    if (this.store.site.assignee != null) {
      if (this.store.site.assignee.id === this.currentUserId) {
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
    if (this.storeCasedForSelectedProject()) {
      return MarkerShape.CHECKED_CIRCLE;
    }
    if (this.store.floating) {
      return MarkerShape.LIFE_RING;
    } else if (this.store.site.duplicate) {
      return MarkerShape.FLAGGED;
    }
    return MarkerShape.FILLED;
  }

  private getScale(shape: any) {
    if (this.storeCasedForSelectedProject()) {
      return 0.03;
    }
    if (shape === MarkerShape.LIFE_RING || this.storeCasedForSelectedProject()) {
      return 0.06;
    }
    if (this.store.storeType === 'HISTORICAL' || this.store.storeType === 'FUTURE') {
      return 0.05;
    }
    return 0.075;
  }

  private getAnchor(shape: any) {
    const bottom = 510;
    if (shape === MarkerShape.FLAGGED) {
      return new google.maps.Point(80, bottom);
    }
    return new google.maps.Point(255, bottom);
  }

  private getStrokeWeight(shape: any) {
    if (shape === MarkerShape.LIFE_RING  || this.storeCasedForSelectedProject()) {
      return 1.2;
    }
    return 2.5;
  }

  private getRotation() {
    // TODO Set Rotation for Future and Historical
    if (this.store.storeType === 'HISTORICAL') {
      return -90;
    } else if (this.store.storeType === 'FUTURE') {
      return 90;
    }
    return 0;
  }

  private getLabelOrigin(shape: any) {
    const zoom = this.map.getZoom();
    if (zoom > this.HIGH_ZOOM) {
      if (this.store.storeType === 'HISTORICAL') {
        return new google.maps.Point(-120, 0);
      } else if (this.store.storeType === 'FUTURE') {
        return new google.maps.Point(255, -255);
      }
      return new google.maps.Point(255, -80);
    }
    if (shape === MarkerShape.FLAGGED) {
      return new google.maps.Point(255, 238);
    }
    if (this.store.storeType === 'HISTORICAL' || this.store.storeType === 'FUTURE') {
      return new google.maps.Point(255, 190);
    }
    return new google.maps.Point(255, 230);
  }

  private static getFillOpacity(markerType?: MarkerType) {
    if (markerType === MarkerType.LABEL) {
      return 0.6;
    }
    return 1;
  }

}
