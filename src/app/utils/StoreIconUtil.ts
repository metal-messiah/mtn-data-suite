import { StoreMarker } from '../models/store-marker';
import { MarkerShape } from '../core/functionalEnums/MarkerShape';
import { DateUtil } from './date-util';
import { Color } from '../core/functionalEnums/Color';

export class StoreIconUtil {

  // For Store Validation
  private static readonly gradient = [
    '#ffc511', '#ffb30f', '#ffa313', '#fb921a', '#f68221', '#ef7228',
    '#e6622f', '#dc5435', '#d1463c', '#c53742', '#b72948', '#aa1c4f',
    '#990b56', '#87005d', '#710066', '#59006f', '#3c0078', '#000080'
  ];

  public static getStoreIconStrokeWeight(store: StoreMarker, showLogo: boolean, showCased: boolean) {
    if (showCased || showLogo) {
      return 2.0;
    }
    return store.float ? 1.2 : 2.5;
  }

  public static getStoreIconScale(store: StoreMarker, showLogo: boolean, showCased: boolean) {
    if (showCased || showLogo) {
      return 0.1;
    }
    return store.float ? 0.06 : 0.075;
  }

  public static getStoreIconAnchorPoint(store: StoreMarker, showLogo: boolean, showCased: boolean) {
    if (showCased || showLogo) {
      switch (store.storeType) {
        case 'FUTURE':
          return new google.maps.Point(-10, 0);
        case 'HISTORICAL':
          return new google.maps.Point(100, 0);
        default:
          return new google.maps.Point(0, 0);
      }
    }
    return store.float ? new google.maps.Point(255, 580) : new google.maps.Point(255, 510);
  }

  public static getStoreIconRotation(store: StoreMarker, showLogo: boolean, showCased: boolean) {
    if (showCased || showLogo) {
      return 0;
    }
    switch (store.storeType) {
      case 'FUTURE':
        return 90;
      case 'HISTORICAL':
        return -90;
      default:
        return 0;
    }
  }

  public static getStoreIconMarkerShape(store: StoreMarker, showLogo: boolean, showCased: boolean, showValidated: boolean) {
    if (showValidated) {
      return MarkerShape.CERTIFICATE
    }
    if (showCased || showLogo) {
      return MarkerShape.CIRCLE;
    }
    return store.float ? MarkerShape.LIFE_RING : MarkerShape.FILLED;
  }

  public static getStoreIconFillColor(store: StoreMarker, selected: boolean, assignedToUser: boolean, assignedToOther: boolean,
                                      showValidated: boolean) {
    if (showValidated) {
      let age = DateUtil.monthsBetween(new Date(), store.validatedDate);
      if (age > StoreIconUtil.gradient.length - 1) {
        age = StoreIconUtil.gradient.length - 1;
      }
      return StoreIconUtil.gradient[age];
    }

    return StoreIconUtil.getFillColor(selected, assignedToUser, assignedToOther);
  }

  public static getFillColor(selected: boolean, assignedToUser: boolean, assignedToOther: boolean): string {
    if (assignedToUser) {
      return selected ? Color.GREEN_DARK : Color.GREEN;
    } else if (assignedToOther) {
      return selected ? Color.RED_DARK : Color.RED;
    } else {
      return selected ? Color.BLUE_DARK : Color.BLUE;
    }
  }

  public static getStoreLabelAnchor(store: StoreMarker, showLogo: boolean, showCased: boolean, showFullLabel: boolean) {

    if (showCased || showLogo) {
      switch (store.storeType) {
        case 'HISTORICAL':
          return new google.maps.Point(10, -10);
        case 'FUTURE':
          return new google.maps.Point(-10, -10);
        default:
          return new google.maps.Point(-5, showCased ? 20 : 30);
      }
    }

    switch (store.storeType) {
      case 'HISTORICAL':
        return showFullLabel ? new google.maps.Point(40, 10) : new google.maps.Point(23, 8);
      case 'FUTURE':
        return showFullLabel ? new google.maps.Point(-40, 10) : new google.maps.Point(-25, 8);
      default:
        return showFullLabel ? new google.maps.Point(0, 60) : new google.maps.Point(0, 32);
    }
  }

  public static getStoreLabelClass(store: StoreMarker, selected: boolean, showLogo: boolean, showCased: boolean, showFullLabel: boolean) {
    // Logos
    if (showCased || showLogo) {
      switch (store.storeType) {
        case 'HISTORICAL':
          return selected ? 'db-marker-image-label-historical-selected' : 'db-marker-image-label-historical';
        case 'FUTURE':
          return selected ? 'db-marker-image-label-future-selected' : 'db-marker-image-label-future';
        default:
          return selected ? 'db-marker-image-label-active-selected' : 'db-marker-image-label-active';
      }
    }

    // Normal
    switch (store.storeType) {
      case 'HISTORICAL':
        return showFullLabel ? 'db-marker-full-label-historical' : 'db-marker-short-label';
      case 'FUTURE':
        return showFullLabel ? 'db-marker-full-label-future' : 'db-marker-short-label';
      default:
        return showFullLabel ? 'db-marker-full-label-active' : 'db-marker-short-label';
    }
  }

  public static getStoreLabelContent(store: StoreMarker, showLogo: boolean, showFullLabel: boolean) {
    let labelText = '';
    if (showLogo) {
      const pictureLabel = document.createElement('img');
      pictureLabel.src = `https://res.cloudinary.com/mtn-retail-advisors/image/upload/c_limit,h_20/${store.logoFileName}`;
      return pictureLabel
    }
    if (store.storeName) {
      if (showFullLabel) {
        labelText = store.storeName
      } else {
        labelText = store.storeName[0];
      }
    }
    return labelText;
  }

}
