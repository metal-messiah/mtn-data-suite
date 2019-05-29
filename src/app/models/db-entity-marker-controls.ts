import { SimplifiedStoreList } from './simplified/simplified-store-list';
import { UserProfile } from './full/user-profile';
import { SimplifiedBanner } from './simplified/simplified-banner';
import * as _ from 'lodash';

export class DbEntityMarkerControls {

  showActive: boolean;
  showHistorical: boolean;
  showFuture: boolean;
  showEmptySites: boolean;
  showSitesBackfilledByNonGrocery: boolean;
  showFloat: boolean;
  cluster: boolean;
  clusterZoomLevel: number;
  minPullZoomLevel: number;
  fullLabelMinZoomLevel: number;
  markerType: string;
  updateOnBoundsChange: boolean;
  storeList: SimplifiedStoreList;
  showClosed: boolean;
  showDeadDeal: boolean;
  showNewUnderConstruction: boolean;
  showOpen: boolean;
  showPlanned: boolean;
  showProposed: boolean;
  showRemodel: boolean;
  showRumored: boolean;
  showStrongRumor: boolean;
  showTemporarilyClosed: boolean;
  banners: SimplifiedBanner[];
  assignment: UserProfile;

  constructor(obj?: any) {
    if (obj) {
      Object.assign(this, obj);
      if (obj.storeList) {
        this.storeList = new SimplifiedStoreList(obj.storeList);
      }
      if (obj.banners) {
        this.banners = obj.banners.map(b => new SimplifiedBanner(b));
      }
      if (obj.assignment) {
        this.assignment = new UserProfile(obj.assignment);
      }
    } else {
      this.reset();
    }
  }

  private reset() {
    //// FILTERS ////
    // DATASET
    this.storeList = null;
    // TYPE
    this.showActive = true;
    this.showHistorical = true;
    this.showFuture = true;
    this.showEmptySites = true;
    this.showSitesBackfilledByNonGrocery = false;
    this.showFloat = false;
    // STATUS
    this.showClosed = true;
    this.showDeadDeal = false;
    this.showNewUnderConstruction = true;
    this.showOpen = true;
    this.showPlanned = true;
    this.showProposed = true;
    this.showRemodel = true;
    this.showRumored = false;
    this.showStrongRumor = false;
    this.showTemporarilyClosed = false;
    // BANNER
    this.banners = [];
    // ASSIGNMENT
    this.assignment = null;

    //// OPTIONS ////
    // MARKER TYPE
    this.markerType = 'Pin';
    // MAP OPTIONS
    this.cluster = false;
    this.clusterZoomLevel = 13;
    this.minPullZoomLevel = 10;
    this.fullLabelMinZoomLevel = 16;
    this.updateOnBoundsChange = true
  }

  addBanner(banner: SimplifiedBanner) {
    if (!this.banners.find(b => b.id === banner.id)) {
      this.banners.push(banner);
      this.banners.sort((a, b) => a.bannerName.localeCompare(b.bannerName));
    }
  }

  removeBanner(banner: SimplifiedBanner) {
    _.remove(this.banners, (b => b.id === banner.id));
  }
}
