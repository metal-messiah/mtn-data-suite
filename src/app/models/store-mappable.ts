import { SimplifiedStore } from './simplified/simplified-store';
import { UserProfile } from './full/user-profile';
import { Color } from '../core/functionalEnums/Color';
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { MarkerShape } from '../core/functionalEnums/MarkerShape';
import { Coordinates } from './coordinates';
import Icon = google.maps.Icon;
import Symbol = google.maps.Symbol;
import MarkerLabel = google.maps.MarkerLabel;
import { EntityMappable } from '../interfaces/entity-mappable';
import { SimplifiedSite } from './simplified/simplified-site';
import { Site } from './full/site';

export class StoreMappable implements EntityMappable {

  id: number;
  private readonly currentUserId: number;
  private readonly getSelectedProjectId: () => number;

  private store: SimplifiedStore;
  private selected = false;
  private moving = false;

  private readonly HIGH_ZOOM = 13;
  private readonly MID_ZOOM = 16;

  constructor(store: SimplifiedStore, currentUserId: number, getSelectedProjectId: () => number) {
    this.store = store;
    this.id = store.id;
    this.currentUserId = currentUserId;
    this.getSelectedProjectId = getSelectedProjectId;
  }

  getCoordinates(): Coordinates {
    return {lat: this.store.site.latitude, lng: this.store.site.longitude};
  };

  isDraggable(): boolean {
    return this.moving;
  }

  getLabel(zoom: number, markerType?: MarkerType): string|MarkerLabel {
    if (this.storeCasedForSelectedProject()) {
      return null;
    }
    if (markerType === MarkerType.LOGO && this.store.banner != null && this.store.banner.logoFileName != null) {
      return null;
    }
    let label = null;
    if (this.store.banner != null) {
      label = this.store.banner.bannerName;
    } else {
      label = this.store.storeName;
    }
    if (label == null) {
      label = '?';
    }
    if (zoom > this.HIGH_ZOOM) {
      return {
        color: Color.BLACK,
        fontWeight: 'bold',
        text: label
      };
    }
    if (zoom < this.MID_ZOOM) {
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

  getIcon(zoom: number, markerType?: MarkerType): string | Icon | Symbol {
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
    const fillOpacity = this.getFillOpacity(markerType);
    const rotation = this.getRotation();
    const labelOrigin = this.getLabelOrigin(shape, zoom);

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
    return this.getSelectedProjectId() != null &&
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

  private getLabelOrigin(shape: any, zoom: number) {
    if (zoom > this.HIGH_ZOOM) {
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

  private getFillOpacity(markerType?: MarkerType) {
    if (markerType === MarkerType.LABEL) {
      return 0.6;
    }
    return 1;
  }

  getSite(): (Site | SimplifiedSite) {
    return this.getEntity().site;
  };

}
