import { ReportData } from '../../models/report-data';
import { MapService } from '../../core/services/map.service';
import { StoreListItem } from '../../models/store-list-item';
import { ReportBuilderService } from '../services/report-builder.service';

import * as _ from 'lodash';

export class JsonToTablesUtil {

  readonly tableData: ReportData;
  readonly reportMetaData;
  readonly siteEvaluationNarrative;
  readonly siteEvaluationRatings;

  readonly sovStores: StoreListItem[];
  readonly sovOverflowStores: StoreListItem[];
  readonly currentWeeklyStores: StoreListItem[];
  readonly currentWeeklyStoresOverflow: StoreListItem[] = [];
  readonly projectedWeeklyStores: StoreListItem[];
  readonly projectedWeeklyStoresOverflow: StoreListItem[] = [];

  readonly targetStore: StoreListItem;

  private readonly googleMapsKey = 'AIzaSyBwCet-oRMj-K7mUhd0kcX_0U1BW-xpKyQ';

  private readonly maxSovCount = 20;

  private rbs: ReportBuilderService;

  readonly tableNames = ['projections', 'currentSummary', 'projectedSummary', 'sovData', 'ratings'];

  constructor(rbs: ReportBuilderService) {
    this.rbs = rbs;
    this.reportMetaData = rbs.getReportMetaData();
    this.tableData = rbs.getReportTableData();
    this.siteEvaluationNarrative = rbs.getSiteEvaluationNarrative();
    this.siteEvaluationRatings = rbs.getSiteEvaluationRatings();

    this.targetStore = this.tableData.storeList.find(item => item.mapKey === this.tableData.selectedMapKey);

    const tableStores = this.tableData.storeList
    // only get the ones matching the category
      .filter(store => store.category !== 'Do Not Include')
      .map(store => {
        const {storeBeforeSiteOpen, storeAfterSiteOpen} = this.getSovBeforeAndAfterStores(store);
        const contributionToSite = store.useTradeAreaChange ? store['tradeAreaChange'] : store['totalChange'];
        store['contributionToSite'] = !this.isTargetStore(store) ? contributionToSite : null;
        store['contributionToSitePerc'] = !this.isTargetStore(store) ? (store['contributionToSite'] /
          storeBeforeSiteOpen.futureSales) * 100 : null;
        return store;
      });

    // To be added back in after
    const forcedInclusions = tableStores.filter(store => store.forceInclusion);

    const sortByContribution = (a, b) => {
      if (a.mapKey === this.tableData.selectedMapKey) {
        return -1;
      }
      if (b.mapKey === this.tableData.selectedMapKey) {
        return 1;
      }
      return Math.abs(b['contributionToSite']) - Math.abs(a['contributionToSite']);
    };

    // Top contributors to the site
    this.sovStores = tableStores
    // sort by target, then by contribution to site
      .sort(sortByContribution)
      .filter(st => Math.abs(st['contributionToSite']) > 500 || st.mapKey === this.targetStore.mapKey)
      // only return the max at most
      .slice(0, this.maxSovCount);

    // Add any forced inclusions back in if they were filtered out
    forcedInclusions.forEach(store => {
      if (!this.sovStores.includes(store)) {
        this.sovStores.push(store);
      }
    });

    // create an array with calculated properties added
    this.sovStores.forEach(store => {
      const {storeBeforeSiteOpen, storeAfterSiteOpen} = this.getSovBeforeAndAfterStores(store);

      store['closing'] = !storeAfterSiteOpen.futureSales;
      store['currentSales'] = storeBeforeSiteOpen.currentSales;
      store['futureSales'] = storeBeforeSiteOpen.futureSales;
      store['resultingVolume'] = store.mapKey === this.targetStore.mapKey ? storeAfterSiteOpen.futureSales
        : store['futureSales'] - store['contributionToSite'];

      store['distance'] =
        MapService.getDistanceBetween(
          {lat: store.latitude, lng: store.longitude},
          {
            lat: this.targetStore.latitude,
            lng: this.targetStore.longitude
          }
        ) * 0.000621371;
    });
    this.sovStores.sort(sortByContribution);

    // If it isn't included in SOV, then it belongs in the overflow.
    this.sovOverflowStores = tableStores.filter(store => !this.sovStores.includes(store));

    // Current Summary
    const cStores = tableStores.filter(store => store.actualSales).sort((a, b) => a.mapKey - b.mapKey);
    const partitionedCurrent = _.partition(cStores, store => {
      return this.sovStores.find(s => Math.round(s.mapKey) === Math.round(store.mapKey)) != null;
    });
    this.currentWeeklyStores = partitionedCurrent[0];
    this.currentWeeklyStoresOverflow = partitionedCurrent[1];

    // Projected Summary
    const pStores = tableStores
    // store or replacement is major contributor
      .map(store => {
        const {storeBeforeSiteOpen, storeAfterSiteOpen} = this.getSovBeforeAndAfterStores(store);
        const contributionToSite = storeBeforeSiteOpen.futureSales - storeAfterSiteOpen.futureSales;
        store['projectedSales'] = Math.round((storeBeforeSiteOpen.futureSales - contributionToSite) / 1000) * 1000;
        store['projectedSalesPSF'] = store['projectedSales'] / store.salesArea;
        return store;
      })
      // Exclude those that don't have projected volumes (closed)
      .filter(store => store['projectedSales'])
      .sort((a, b) => a.mapKey - b.mapKey);
    const partitionedProjected = _.partition(pStores, store => {
      return this.sovStores.find(s => Math.round(s.mapKey) === Math.round(store.mapKey)) != null;
    });
    this.projectedWeeklyStores = partitionedProjected[0];
    this.projectedWeeklyStoresOverflow = partitionedProjected[1];
  }

  getReportData() {
    return {
      projections: this.getProjectionsTableData(),
      currentSummary: this.getCurrentSummaryTableData(),
      projectedSummary: this.getProjectedSummaryTableData(),
      sovData: this.getSovReportData(),
      mapUrl: '',
      ratings: this.siteEvaluationRatings,
      narrativeData: this.getNarrativeData(),
      marketShareDataHeaders: ['sector', 'projectedSales', 'projectedMS', 'effectivePower', 'futurePop1', 'projectedPotential',
        'projectedPCW', 'leakage', 'distribution', 'futurePop2', 'futurePop3'],
      marketShareData: this.tableData.marketShareBySector,
      sovMapDataHeaders: ['mapKey', 'latitude', 'longitude', 'category', 'currentSales', 'firstYearEndingSales', 'contributionToSite',
        'contributionToSitePerc', 'resultingVolume'],
      sovMapData: this.getSovMapData(),
    };
  }

  getMapUrl(basemap: string, zoom: number) {
    // map image
    const target = this.targetStore;
    const targetPin = `&markers=color:red%7C${target.latitude},${target.longitude}`;

    const {latitude, longitude} = target;

    return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}` +
      `&zoom=${zoom}&size=470x350&maptype=${basemap}&${targetPin}&key=${this.googleMapsKey}`;
  }

  private getSovReportData() {
    return {
      firstYearEndDate: this.tableData.firstYearEndingDate,
      fieldResDate: this.reportMetaData.fieldResDate,
      openingDate: this.tableData.storeOpeningDate,
      salesTransferFromCompanyStores: this.getSalesTransfersFromCompanyStores(),
      salesTransferFromCompetition: this.getSalesTransfersFromCompetition(),
      totalSalesTransfer: this.getTotalSalesTransfers(),
      percentOfSalesExplainedAfterOneYear: this.getPercentOfSalesExplained(),
      showingCount: this.sovStores.length,
      totalCount: this.sovStores.length + this.sovOverflowStores.length,
      totalContributionExcluded: this.getOverflowSum(),
      targetStoreMapKey: this.targetStore.mapKey,
      companyStores: this.getSovStoresForTable('Company Store'),
      companyStoresSummary: this.getSovCompanyStoresSummary('Company Store'),
      existingCompetition: this.getSovStoresForTable('Existing Competition'),
      existingCompetitionSummary: this.getSovCompanyStoresSummary('Existing Competition'),
      proposedCompetition: this.getSovStoresForTable('Proposed Competition'),
      proposedCompetitionSummary: this.getSovCompanyStoresSummary('Proposed Competition'),
    };
  }

  private getSovCompanyStoresSummary(category: string) {
    return {
      fitAverage: this.getSovFitAverageForCategory(category),
      contributionSum: this.getSovContributionToSiteSubtotal(category)
    };
  }

  private getSovStoresForTable(category: string) {
    return this.getSovStoresOfCategory(category)
      .map(store => {
        return {
          storeName: store.storeName,
          address: store.location,
          mapKey: store.mapKey,
          power: store.effectivePower,
          distance: store['distance'],
          salesArea: store.salesArea,
          totalArea: store.totalArea,
          currentSales: store.actualSales,
          futureSales: store['futureSales'],
          contributionDollars: store['contributionToSite'],
          contributionPercent: store['contributionToSitePerc'],
          resultingVolume: store['resultingVolume'],
          closing: store['closing'],
          isSite: store.mapKey === this.targetStore.mapKey
        };
      });
  }

  private getProjectedSummaryTableData() {
    return {
      date: this.tableData.firstYearEndingDate,
      stores: this.getProjectedSummaryStores(),
      summary: this.getProjectedSummaryAverages(),
      overflowCount: this.currentWeeklyStoresOverflow.length
    };
  }

  private getProjectedSummaryStores() {
    return this.projectedWeeklyStores.map(store => {
      return {
        mapKey: store.mapKey,
        storeName: store.storeName,
        location: store.location,
        volume: store['projectedSales'],
        psf: store['projectedSalesPSF'],
        salesArea: store.salesArea,
        pwta: store.PWTA,
        fitPower: store.effectivePower,
        category: store.category,
        isSite: store.mapKey === this.targetStore.mapKey,
        scenario: store.scenario
      };
    });
  }

  private getProjectedSummaryAverages() {
    return {
      volume: this.getSummaryAverage(this.projectedWeeklyStores, 'projectedSales'),
      psf: this.getSummaryAverage(this.projectedWeeklyStores, 'projectedSalesPSF'),
      salesArea: this.getSummaryAverage(this.projectedWeeklyStores, 'salesArea'),
      power: this.getSummaryAverage(this.projectedWeeklyStores, 'effectivePower'),
    };
  }

  private getCurrentSummaryTableData() {
    return {
      date: this.reportMetaData.fieldResDate,
      stores: this.getCurrentSummaryStores(),
      summary: this.getCurrentSummaryAverages(),
      overflowCount: this.currentWeeklyStoresOverflow.length
    };
  }

  private getCurrentSummaryAverages() {
    return {
      volume: this.getSummaryAverage(this.currentWeeklyStores, 'actualSales'),
      psf: this.getSummaryAverage(this.currentWeeklyStores, 'actualSalesPSF'),
      salesArea: this.getSummaryAverage(this.currentWeeklyStores, 'salesArea'),
      power: this.getSummaryAverage(this.currentWeeklyStores, 'effectivePower'),
    };
  }

  private getCurrentSummaryStores() {
    return this.currentWeeklyStores.map(store => {
      return {
        mapKey: store.mapKey,
        storeName: store.storeName,
        location: store.location,
        volume: store.actualSales,
        psf: store.actualSalesPSF,
        salesArea: store.salesArea,
        pwta: store.PWTA,
        fitPower: store.effectivePower
      };
    });
  }

  private getProjectionsTableData() {
    const ts = this.targetStore;
    const sgps = this.tableData.salesGrowthProjections;
    return {
      mapKey: ts.mapKey,
      storeName: ts.storeName,
      power: ts.effectivePower,
      salesArea: ts.salesArea,
      totalArea: ts.totalArea,
      firstYearEndingSales: sgps.firstYearEndingSales,
      firstYearEndingSalesPSF: sgps.firstYearEndingSalesPSF,
      secondYearEndingSales: sgps.secondYearEndingSales,
      secondYearEndingSalesPSF: sgps.secondYearEndingSalesPSF,
      thirdYearEndingSales: sgps.thirdYearEndingSales,
      thirdYearEndingSalesPSF: sgps.thirdYearEndingSalesPSF,
      firstYearAnnualizedSales: sgps.firstYearEndingSales * 52,
      firstYearAnnualizedSalesPSF: sgps.firstYearEndingSales * 52 / ts.salesArea,
      firstYearAnnualizedSalesPSFTotalArea: sgps.firstYearEndingSales * 52 / ts.totalArea,
      comment: this.reportMetaData.type
    };
  }

  private getSovMapData() {

    return this.sovStores.map(s => {
      return {
        mapKey: s.mapKey,
        latitude: s.latitude,
        longitude: s.longitude,
        category: s.category,
        currentSales: s['actualSales'],
        firstYearEndingSales: s['futureSales'],
        contributionToSite: s['contributionToSite'],
        contributionToSitePerc: s['contributionToSitePerc'],
        resultingVolume: s['closing'] ? 0 : s['resultingVolume']
      };
    });
  }

  private getNarrativeData() {
    let txt = '';

    Object.keys(this.reportMetaData).forEach(key => {
      txt += `${key}:\r\n${this.reportMetaData[key]}\r\n\r\n`;
    });

    txt += `Store Name:\r\n${this.targetStore.storeName}\r\n\r\n`;
    txt += `Map Key:\r\n${this.targetStore.mapKey}\r\n\r\n`;

    if (this.siteEvaluationNarrative) {
      Object.keys(this.siteEvaluationNarrative).forEach(key => {
        txt += `${key}:\r\n${this.siteEvaluationNarrative[key]}\r\n\r\n`;
      });
    }
    return txt;
  }

  getSovStoresOfCategory(category) {
    // categories => Company Store, Proposed Competition, Existing Competition
    return this.sovStores.filter(store => store.category === category);
  }

  getSummaryAverage(data, field) {
    return data.map(s => s[field]).reduce((prev, next) => prev + next) / data.length;
  }

  getSovFitAverageForCategory(category: String) {
    // categories => Company Store, Proposed Competition, Existing Competition
    const fitStorePowerValues = [];
    let fitStorePowerAverage = 0;
    this.getSovStoresOfCategory(category)
      .filter(store => !this.isTargetStore(store))
      .forEach(store => fitStorePowerValues.push(store.effectivePower));
    if (fitStorePowerValues.length > 0) {
      fitStorePowerAverage = fitStorePowerValues.reduce((a, b) => a + b) / fitStorePowerValues.length;
    }

    return fitStorePowerAverage;
  }

  getSovContributionToSiteSubtotal(category) {
    // categories => Company Store, Proposed Competition, Existing Competition
    const contributionToSiteValues = [];
    let contributionToSiteAverage = 0;
    this.sovStores.filter(store => store.category === category && !this.isTargetStore(store))
      .forEach(store => {
        contributionToSiteValues.push(store['contributionToSite']);
      });
    if (contributionToSiteValues.length > 0) {
      contributionToSiteAverage = contributionToSiteValues.reduce((a, b) => a + b);
    }

    return contributionToSiteAverage;
  }

  getSalesTransfersFromCompanyStores() {
    return (
      this.getSovContributionToSiteSubtotal('Company Store')
    );
  }

  getSalesTransfersFromCompetition() {
    return this.getSovContributionToSiteSubtotal('Proposed Competition') +
      this.getSovContributionToSiteSubtotal('Existing Competition');
  }

  getTotalSalesTransfers() {
    return this.getSovContributionToSiteSubtotal('Proposed Competition') +
      this.getSovContributionToSiteSubtotal('Existing Competition') +
      this.getSovContributionToSiteSubtotal('Company Store');
  }

  isTargetStore(store) {
    return store.mapKey === this.tableData.selectedMapKey;
  }

  getPercentOfSalesExplained() {
    return (this.getTotalSalesTransfers() / this.targetStore['resultingVolume']) * 100;
  }

  private getSovBeforeAndAfterStores(store) {
    const beforeMatch = this.tableData.projectedVolumesBefore.find(j => j.mapKey === store.mapKey);
    const afterMatch = this.tableData.projectedVolumesAfter.find(j => j.mapKey === store.mapKey);
    return {storeBeforeSiteOpen: beforeMatch, storeAfterSiteOpen: afterMatch};
  }

  public getOverflowSum() {
    if (this.sovOverflowStores && this.sovOverflowStores.length > 1) {
      const sum = this.sovOverflowStores.map(s => s['contributionToSite'])
        .reduce((prev, next) => prev + next);
      return Math.round(sum);
    } else {
      return 0;
    }
  }

}
