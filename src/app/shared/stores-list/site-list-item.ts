import { Coordinates } from '../../models/coordinates';
import { StoreMarker } from '../../models/store-marker';
import { SiteMarker } from '../../models/site-marker';
import { SiteUtil } from '../../utils/SiteUtil';

export class SiteListItem {
  siteId: number;
  address: string;
  intersection: string;
  coords: Coordinates;
  backfilledNonGrocery: boolean;
  vacant: boolean;
  assigneeName: string;
  store: StoreMarker;

  constructor(siteMarker: SiteMarker, storeMarker?: StoreMarker) {
    this.siteId = siteMarker.id;
    this.address = this.getAddressLabel(siteMarker);
    this.intersection = this.getFormattedIntersection(siteMarker);
    this.coords = new Coordinates(siteMarker.latitude, siteMarker.longitude);
    this.backfilledNonGrocery = siteMarker.backfilledNonGrocery;
    this.vacant = siteMarker.vacant;
    this.assigneeName = siteMarker.assigneeName;
    if (storeMarker) {
      this.store = storeMarker;
    }
  }

  private getAddressLabel(siteMarker: SiteMarker) {
    let address = siteMarker.address;
    if (address) {
      address += ', ';
    }
    return address + SiteUtil.getFormattedPrincipality(siteMarker);
  }

  private getFormattedIntersection(site: SiteMarker) {
    return SiteUtil.getFormattedIntersection(site);
  }
}
