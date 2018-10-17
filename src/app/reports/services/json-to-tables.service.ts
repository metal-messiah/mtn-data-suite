import { Injectable } from '@angular/core';

import { ReportData } from '../../models/report-data';
import { MapService } from '../../core/services/map.service';
import { AuthService } from '../../core/services/auth.service';
import { StoreListItem } from '../../models/store-list-item';
import { MatSnackBar } from '@angular/material';
import { StoreService } from '../../core/services/store.service';
import { Store } from '../../models/full/store';
import { SalesGrowthProjectionItem } from '../../models/sales-growth-projection-item';
import { ReportBuilderService } from './report-builder.service';

@Injectable()
export class JsonToTablesService {

  reportTableData: ReportData;
  reportMetaData;
  siteEvaluationData;

  private matchingStore: StoreListItem;
  salesGrowthProjection: SalesGrowthProjectionItem;

  // maxPerSOVCategory = 15;
  maxSOV = 20;

  showedSnackbar = false;
  snackbarRef: any;

  formattedTables = {
    targetStore: null,
    projectionsTable: null,
    currentStoresWeeklySummary: null,
    projectedStoresWeeklySummary: null,
    sourceOfVolume: {
      companyStores: [],
      existingCompetition: [],
      proposedCompetition: [],
      averages: {
        companyStores: {
          fitStorePower: { values: [], average: null },
          contributionToSite: { values: [], average: null }
        },
        existingCompetition: {
          fitStorePower: { values: [], average: null },
          contributionToSite: { values: [], average: null }
        },
        proposedCompetition: {
          fitStorePower: { values: [], average: null },
          contributionToSite: { values: [], average: null }
        }
      }
    }
  };

  constructor(
    public auth: AuthService,
    private snackBar: MatSnackBar,
    public storeService: StoreService
  ) {
  }

  init(reportBuilderService: ReportBuilderService) {
    this.reportMetaData = reportBuilderService.reportMetaData;
    this.reportTableData = reportBuilderService.reportTableData;
    this.siteEvaluationData = reportBuilderService.siteEvaluationData;

    const siteNumber = this.reportTableData.selectedMapKey;
    this.matchingStore = this.reportTableData.storeList
      .filter(item => item.mapKey === siteNumber)[0];
    if (this.reportTableData.salesGrowthProjection[1]) {
      this.salesGrowthProjection = this.reportTableData.salesGrowthProjection[1];
    } else if (this.reportTableData.salesGrowthProjection[0]) {
      this.salesGrowthProjection = this.reportTableData.salesGrowthProjection[0];
    }
  }

  isInitialized() {
    return this.reportMetaData && this.reportTableData && this.siteEvaluationData;
  }

  getProjectionMapKey() {
    return this.reportTableData.selectedMapKey || null;
  }

  getProjectionScenario() {
    return this.matchingStore.storeName || null;
  }

  getProjectionProjectedFitImage() {
    return this.matchingStore.effectivePower || null;
  }

  getProjectionSalesArea() {
    return this.matchingStore.salesArea || null;
  }

  getProjectionTotalArea() {
    return this.matchingStore.totalArea || null;
  }

  getProjection(projectionName: string) {
    if (this.salesGrowthProjection) {
      return Math.round(this.salesGrowthProjection[projectionName] * 0.001);
    } else {
      return null;
    }
  }

  getProjectionPsf(projectionName: string) {
    if (this.salesGrowthProjection) {
      return this.salesGrowthProjection[projectionName] / this.getProjectionSalesArea() ;
    } else {
      return null;
    }
  }

  getProjectionYear1AnnualizedPsfFromTotal() {
    if (this.salesGrowthProjection) {
      return this.salesGrowthProjection.firstYearAverageSales * 52 / this.getProjectionTotalArea();
    } else {
      return null;
    }
  }

  getStoresForExport(category) {
    return this.reportTableData.storeList.filter(
      store => store.category === category && !this.isTargetStore(store)
    );
  }

  getProjectionComment() {
    return this.reportMetaData.type;
  }

  getCurrentStoresWeeklySummary() {
    return this.reportTableData.storeList.filter(store => store.uniqueId);
  }

  getProjectedStoresWeeklySummary() {
    return this.reportTableData.storeList
      .filter(store => store.category !== 'Do Not Include')
      .map(store => {
        const beforeMatch = this.reportTableData.projectedVolumesBefore.filter(
          j => j.mapKey === store.mapKey
        )[0];

        const afterMatch = this.reportTableData.projectedVolumesAfter.filter(
          j => j.mapKey === store.mapKey
        )[0];

        const futureSales = beforeMatch.futureSales;

        const contributionToSite =
          Number(beforeMatch.futureSales) - Number(afterMatch.futureSales);

        store['projectedSales'] =
          Math.round(
            (Number(futureSales) - Number(contributionToSite)) / 1000
          ) * 1000;

        store['projectedSalesPSF'] = store['projectedSales'] / store.salesArea;

        return store;
      });
  }

  getSOVStoreCount(category): number {
    return this.reportTableData.storeList.filter(store => store.category === category).length;
  }

  getSOVMatches(store) {
    const beforematch = this.reportTableData.projectedVolumesBefore.filter(
      j => j.mapKey === store.mapKey
    )[0];

    const aftermatch = this.reportTableData.projectedVolumesAfter.filter(
      j => j.mapKey === store.mapKey
    )[0];
    return { beforematch, aftermatch };
  }

  getTruncatedSOVStores() {
    const stores = this.reportTableData.storeList
      // only get the ones matching the cat
      .filter(store => store.category !== 'Do Not Include')
      .map(store => {
        const { beforematch, aftermatch } = this.getSOVMatches(store);
        store['contributionToSite'] = !this.isTargetStore(store)
          ? Math.abs(
              Number(beforematch.futureSales) - Number(aftermatch.futureSales)
            )
          : null;
        return store;
      })
      // sort by target, then by contribution to site
      .sort((a, b) => {
        if (a.mapKey === this.reportTableData.selectedMapKey) {
          return -1;
        }
        if (b.mapKey === this.reportTableData.selectedMapKey) {
          return 1;
        }
        return b['contributionToSite'] - a['contributionToSite'];
      });
    // only return the max at most
    const overflow = stores
      .map((s, i) => {
        if (i >= this.maxSOV) {
          return s['contributionToSite'];
        }
      })
      .filter(s => s);

    if (overflow.length) {
      const threshold = stores[this.maxSOV - 1]['contributionToSite'];
      const overflowSum = overflow.reduce((prev, next) => prev + next);

      if (!this.showedSnackbar) {
        this.showedSnackbar = true;
        const truncatedMsg = `*Does not show contributions less than $${threshold.toLocaleString()} (Showing ${stores.length -
          overflow.length}/${
          stores.length
        } Stores). A total Contribution To Site of $${overflowSum.toLocaleString()} was excluded from the Report.`
        this.snackBar.open(truncatedMsg, 'OK');
      }
    }

    return stores.splice(0, this.maxSOV);
  }

  getSOVStores(category) {
    // categories => Company Store, Proposed Competition, Existing Competition
    return (
      this.getTruncatedSOVStores()
        // only get the ones matching the cat
        .filter(store => store.category === category)
        // create an array with new properties added
        .map(store => {
          const { beforematch, aftermatch } = this.getSOVMatches(store);

          store['currentSales'] = beforematch.currentSales;

          store['futureSales'] = beforematch.futureSales;

          store['contributionToSite'] = !this.isTargetStore(store)
            ? Math.abs(
                Number(beforematch.futureSales) - Number(aftermatch.futureSales)
              )
            : null;
          store['contributionToSitePerc'] = !this.isTargetStore(store)
            ? (Number(store['contributionToSite']) /
                Number(store['futureSales'])) *
              100
            : null;

          store['resultingVolume'] =
            store.mapKey === this.matchingStore.mapKey
              ? aftermatch.futureSales
              : store['futureSales'] - store['contributionToSite'];

          store['distance'] =
            MapService.getDistanceBetween(
              { lat: store.latitude, lng: store.longitude },
              {
                lat: this.matchingStore.latitude,
                lng: this.matchingStore.longitude
              }
            ) * 0.000621371;

          return store;
        })
    );
  }

  getSummaryAverage(dataSet, field) {
    const data = dataSet === 'current' ? this.getCurrentStoresWeeklySummary() : this.getProjectedStoresWeeklySummary();
    const values = data.map(s => s[field]);
    const sum =  values.reduce((prev, next) => prev + next);
    return sum / values.length;
  }

  updateSOVTotalSize(store, value) {
    if (store.uniqueId) {
      this.storeService.getOneById(store.uniqueId).subscribe((s: Store) => {
        s['areaTotal'] = value;
        this.storeService.update(s).subscribe(res => {
          console.log('updated db', res);
        });
      });
    } else {
      const snackBarMsg = 'Updated the local table but could not update the database because the store does not exist there.';
      this.snackBar.open(snackBarMsg, 'OK');
    }
    const idx = this.reportTableData.storeList.findIndex(s => s.mapKey === store.mapKey);
    if (idx !== -1) {
      this.reportTableData.storeList[idx].totalArea = value;
    }
    console.log('updated json');
  }

  getSOVAverages(category) {
    // categories => Company Store, Proposed Competition, Existing Competition
    const fitStorePowerValues = [];
    let fitStorePowerAverage = 0;
    const contributionToSiteValues = [];
    let contributionToSiteAverage = 0;
    this.reportTableData.storeList.filter(store => store.category === category && !this.isTargetStore(store))
      .forEach(store => {
        fitStorePowerValues.push(store.effectivePower);
        contributionToSiteValues.push(store['contributionToSite']);
      });
    if (fitStorePowerValues.length) {
      fitStorePowerAverage =
        fitStorePowerValues.reduce((a, b) => a + b) /
        fitStorePowerValues.length;
    }
    if (contributionToSiteValues.length) {
      contributionToSiteAverage = contributionToSiteValues.reduce(
        (a, b) => a + b
      );
    }

    return { fitStorePowerAverage, contributionToSiteAverage };
  }

  getSalesTransfersFromCompanyStores() {
    return (
      this.getSOVAverages('Company Store').contributionToSiteAverage / 1000
    );
  }

  getSalesTransfersFromCompetition() {
    return (
      (this.getSOVAverages('Proposed Competition').contributionToSiteAverage +
        this.getSOVAverages('Existing Competition').contributionToSiteAverage) /
      1000
    );
  }

  getTotalSalesTransfers() {
    return (
      (this.getSOVAverages('Proposed Competition').contributionToSiteAverage +
        this.getSOVAverages('Existing Competition').contributionToSiteAverage +
        this.getSOVAverages('Company Store').contributionToSiteAverage) /
      1000
    );
  }

  isTargetStore(store) {
    return store.mapKey === this.reportTableData.selectedMapKey;
  }

  getTargetStore() {
    return this.matchingStore;
  }

  getAfterOpen1Year() {
    return this.matchingStore['resultingVolume'] / 1000;
  }

  getPercentOfSalesExplained() {
    return (this.getTotalSalesTransfers() / this.getAfterOpen1Year()) * 100;
  }
}
