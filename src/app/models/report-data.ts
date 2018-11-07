import { StoreListItem } from './store-list-item';
import { VolumeItem } from './volume-item';
import { MarketShareBySectorItem } from './market-share-by-sector-item';
import { SectorListItem } from './sector-list-item';

export class ReportData {

  storeList: StoreListItem[] = [];
  projectedVolumesBefore: VolumeItem[] = [];
  projectedVolumesAfter: VolumeItem[] = [];
  salesGrowthProjections: {
    firstYearAverageSales: number,
    firstYearAverageSalesPSF: number,
    secondYearAverageSales: number,
    secondYearAverageSalesPSF: number,
    thirdYearAverageSales: number,
    thirdYearAverageSalesPSF: number,
    fourthYearAverageSales: number,
    fourthYearAverageSalesPSF: number,
    fifthYearAverageSales: number,
    fifthYearAverageSalesPSF: number,
    firstYearEndingSales: number,
    firstYearEndingSalesPSF: number,
    secondYearEndingSales: number,
    secondYearEndingSalesPSF: number,
    thirdYearEndingSales: number,
    thirdYearEndingSalesPSF: number,
    fourthYearEndingSales: number,
    fourthYearEndingSalesPSF: number,
    fifthYearEndingSales: number,
    fifthYearEndingSalesPSF: number
  };
  marketShareBySector: MarketShareBySectorItem[] = [];
  sectorList: SectorListItem[] = [];

  firstYearEndingMonthYear: string;
  selectedMapKey: number;

}
