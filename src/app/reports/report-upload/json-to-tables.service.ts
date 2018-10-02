import { Injectable } from '@angular/core';

import { HTMLasJSON } from '../../models/html-as-json';
import { ReportUploadInterface } from '../../reports/report-upload/report-upload-interface';
import { ProjectionsTable } from '../../models/projections-table';
import { MapService } from '../../core/services/map.service';
import { AuthService } from '../../core/services/auth.service';
import { StoreListItem } from '../../models/store-list-item';
import { MatSnackBar, SimpleSnackBar } from '@angular/material';

@Injectable()
export class JsonToTablesService {
  mapService: MapService;

  modelData: ReportUploadInterface;
  json: HTMLasJSON;
  matchingStore: StoreListItem;
  salesGrowthProjection;

  maxPerSOVCategory = 15;

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

  constructor(public auth: AuthService, private snackBar: MatSnackBar) {
    this.mapService = new MapService(auth);
  }

  init(modelData: ReportUploadInterface, json: HTMLasJSON) {
    this.modelData = modelData;
    this.maxPerSOVCategory = modelData.maxPerSOV;
    this.json = json;
    const { siteNumber, type } = modelData;
    this.matchingStore = json.storeList.filter(
      item => item.mapKey === siteNumber
    )[0];
    this.salesGrowthProjection = json.salesGrowthProjection[1]
      ? json.salesGrowthProjection[1]
      : json.salesGrowthProjection[0]
        ? json.salesGrowthProjection[0]
        : null;
  }

  isInitialized() {
    if (this.modelData && this.json) {
      return true;
    }
    return false;
  }

  getProjectionMapKey() {
    return this.modelData.siteNumber || null;
  }

  getProjectionScenario() {
    return this.getTargetStore().storeName || null;
  }

  getProjectionProjectedFitImage() {
    return this.matchingStore.effectivePower || null;
  }

  getProjectionSalesArea() {
    return this.matchingStore.salesArea || null;
  }

  getProjectionYear1Ending() {
    if (this.salesGrowthProjection) {
      return Math.round(
        Number(this.salesGrowthProjection.firstYearAverageSales) * 0.001
      );
    } else {
      return null;
    }
  }

  getProjectionYear2Ending() {
    if (this.salesGrowthProjection) {
      return Math.round(
        Number(this.salesGrowthProjection.secondYearAverageSales) * 0.001
      );
    } else {
      return null;
    }
  }

  getProjectionYear3Ending() {
    if (this.salesGrowthProjection) {
      return Math.round(
        Number(this.salesGrowthProjection.thirdYearAverageSales) * 0.001
      );
    } else {
      return null;
    }
  }

  getStoresForExport(category) {
    return this.json.storeList.filter(store => store.category === category && !this.isTargetStore(store));
  }

  getProjectionComment() {
    return this.modelData.type;
  }

  getCurrentStoresWeeklySummary() {
    return this.json.storeList.filter(store => store.uniqueId);
  }

  getProjectedStoresWeeklySummary() {
    return this.json.storeList
      .filter(store => store.category !== 'Do Not Include')
      .map(store => {
        const beforematch = this.json.projectedVolumesBefore.filter(
          j => j.mapKey === store.mapKey
        )[0];

        const aftermatch = this.json.projectedVolumesAfter.filter(
          j => j.mapKey === store.mapKey
        )[0];

        const currentSales = beforematch.currentSales;
        const futureSales = beforematch.futureSales;

        const contributionToSite =
          Number(beforematch.futureSales) - Number(aftermatch.futureSales);
        const contributionToSitePerc =
          (Number(contributionToSite) / Number(futureSales)) * 100;

        store['projectedSales'] =
          Math.round(
            (Number(futureSales) - Number(contributionToSite)) / 1000
          ) * 1000;

        store['projectedSalesPSF'] = store['projectedSales'] / store.salesArea;

        return store;
      });
  }

  getSOVStoreCount(category) {
    return (
      this.json.storeList.filter(store => store.category === category).length >
      0
    );
  }
  getSOVMatches(store) {
    const beforematch = this.json.projectedVolumesBefore.filter(
      j => j.mapKey === store.mapKey
    )[0];

    const aftermatch = this.json.projectedVolumesAfter.filter(
      j => j.mapKey === store.mapKey
    )[0];
    return { beforematch, aftermatch };
  }

  getSOVStores(category) {
    // categories => Company Store, Proposed Competition, Existing Competition

    const output = this.json.storeList
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
          this.mapService.getDistanceBetween(
            { lat: store.latitude, lng: store.longitude },
            {
              lat: this.matchingStore.latitude,
              lng: this.matchingStore.longitude
            }
          ) * 0.000621371;

        return store;
      })
      // sort by target, then by contribution to site
      .sort((a, b) => {
        if (a.mapKey === this.modelData.siteNumber) {
          return -1;
        }
        if (b.mapKey === this.modelData.siteNumber) {
          return 1;
        }
        return b['contributionToSite'] - a['contributionToSite'];
      });
    // only return 15 at most
    const overflow = output
      .map((s, i) => {
        if (i >= this.maxPerSOVCategory) {
          return s['contributionToSite'];
        }
      })
      .filter(s => s);
    // console.log(overflow);

    if (overflow.length) {
      const threshold = overflow[0];
      const overflowSum = overflow.reduce((prev, next) => prev + next);

      if (!this.showedSnackbar) {
        this.showedSnackbar = true;
        const msg = `SOV does not include anything less than $${threshold.toLocaleString()} (Showing ${output.length -
          overflow.length}/${
          output.length
        } Stores). A total Contribution To Site of $${overflowSum.toLocaleString()} was excluded from the SOV Report.
        If needed, adjust 'Maximum Records per SOV Category
' on step 1, or mark individual sites as 'Do Not Include' on step 2.`;

        this.showSnackbar(msg);
      }
    }

    return output.splice(0, this.maxPerSOVCategory);
  }

  showSnackbar(message) {
    console.log('show snackbar');
    setTimeout(() => {
      this.snackbarRef = this.snackBar.open(message, 'OK', { duration: 99999 });
    }, 1);
  }

  getSOVContributionToSite(store) {}

  getSOVAverages(category) {
    // categories => Company Store, Proposed Competition, Existing Competition
    const fitStorePowerValues = [];
    let fitStorePowerAverage = 0;
    const contributionToSiteValues = [];
    let contributionToSiteAverage = 0;
    this.json.storeList
      .filter(
        store => store.category === category && !this.isTargetStore(store)
      )
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
    return store.mapKey === this.modelData.siteNumber;
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
