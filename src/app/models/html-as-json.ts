import {StoreListItem} from './store-list-item';
import {VolumeItem} from './volume-item';
import {SalesGrowthProjectionItem} from './sales-growth-projection-item';
import {MarketShareBySectorItem} from './market-share-by-sector-item';
import {SectorListItem} from './sector-list-item';

export class HTMLasJSON {
    storeList: StoreListItem[];
    projectedVolumesBefore: VolumeItem[];
    projectedVolumesAfter: VolumeItem[];
    salesGrowthProjection: SalesGrowthProjectionItem[];
    marketShareBySector: MarketShareBySectorItem[];
    sectorList: SectorListItem[];
    firstYearEndingMonthYear: string;
  
    constructor() {
      this.storeList = [];
      this.projectedVolumesBefore = [];
      this.projectedVolumesAfter = [];
      this.salesGrowthProjection = [];
      this.marketShareBySector = [];
      this.sectorList = [];
      this.firstYearEndingMonthYear = null;
    }
  }
