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

  private readonly maxSovCount = 20;


  constructor(rbs: ReportBuilderService) {
    this.reportMetaData = rbs.reportMetaData;
    this.tableData = rbs.reportTableData;
    this.siteEvaluationNarrative = rbs.siteEvaluationNarrative;
    this.siteEvaluationRatings = rbs.siteEvaluationRatings;

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

    this.sovStores = tableStores
    // sort by target, then by contribution to site
      .sort((a, b) => {
        if (a.mapKey === this.tableData.selectedMapKey) {
          return -1;
        }
        if (b.mapKey === this.tableData.selectedMapKey) {
          return 1;
        }
        return Math.abs(b['contributionToSite']) - Math.abs(a['contributionToSite']);
      })
      // only return the max at most
      .slice(0, this.maxSovCount)
      // create an array with calculated properties added
      .map(store => {
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

        return store;
      });

    this.sovOverflowStores = tableStores.slice(this.maxSovCount, tableStores.length);

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

  getTruncatedMessage() {
    if (this.sovOverflowStores && this.sovOverflowStores.length > 1) {
      return `*Does not show contributions less than $${this.getMaxExcludedContribution().toLocaleString()} 
      (Showing ${this.sovStores.length}/${this.sovStores.length + this.sovOverflowStores.length} stores).`
    }
    return null;
  }

  getMaxExcludedContribution() {
    const maxExcludedContribution: number = _.maxBy(this.sovOverflowStores, 'contributionToSite')['contributionToSite'];
    return Math.round(maxExcludedContribution);
  }

  getTruncatedSumMessage() {
    if (this.sovOverflowStores && this.sovOverflowStores.length > 1) {
      return `A total Contribution To Site of $${this.getOverflowSum().toLocaleString()} was excluded from the report.`
    }
    return null;
  }

  getSovStoresOfCategory(category) {
    // categories => Company Store, Proposed Competition, Existing Competition
    return this.sovStores.slice(0, this.maxSovCount).filter(store => store.category === category);
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
