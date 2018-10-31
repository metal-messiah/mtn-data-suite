import { StoreListItem } from './store-list-item';
import { VolumeItem } from './volume-item';
import { SalesGrowthProjectionItem } from './sales-growth-projection-item';
import { MarketShareBySectorItem } from './market-share-by-sector-item';
import { SectorListItem } from './sector-list-item';

export class ReportData {

  storeList: StoreListItem[] = [];
  projectedVolumesBefore: VolumeItem[] = [];
  projectedVolumesAfter: VolumeItem[] = [];
  salesGrowthProjectionAverages: SalesGrowthProjectionItem;
  salesGrowthProjectionYearEnd: SalesGrowthProjectionItem;
  marketShareBySector: MarketShareBySectorItem[] = [];
  sectorList: SectorListItem[] = [];

  firstYearEndingMonthYear: string;
  selectedMapKey: number;

}
