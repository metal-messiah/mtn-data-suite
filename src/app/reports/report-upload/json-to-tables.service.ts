import { Injectable } from '@angular/core';

import { HTMLasJSON } from '../../models/html-as-json';
import { ReportUploadInterface } from '../../reports/report-upload/report-upload-interface';
import { ProjectionsTable } from '../../models/projections-table';
import { MapService } from '../../core/services/map.service';
import { AuthService} from '../../core/services/auth.service';

@Injectable()
export class JsonToTablesService {

  mapService: MapService;

  constructor(
    public auth: AuthService) { 
    this.mapService = new MapService(auth)
  }

  generateTables(modelData: ReportUploadInterface, json: HTMLasJSON) {
    const formattedTables = {
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

    const { retailerName, siteNumber, type } = modelData;
    const matchingStore = json.storeList.filter(
      item => item.mapKey === siteNumber
    )[0];

    const salesGrowthProjection = json.salesGrowthProjection[1]
      ? json.salesGrowthProjection[1]
      : json.salesGrowthProjection[0]
        ? json.salesGrowthProjection[0]
        : null;

    const output = {
      projectionsTable: ProjectionsTable
    };

    console.log(matchingStore);

    //////// PROJECTIONS TABLE ////////
    const projectionsTable = new ProjectionsTable();
    if (matchingStore && salesGrowthProjection) {
      projectionsTable.isValid = true;
      projectionsTable.mapKey = siteNumber || null; // cell 1 of table
      projectionsTable.scenario = retailerName || null; // cell 2 of table
      projectionsTable.projectedFitImage = matchingStore.effectivePower || null; // cell 3
      projectionsTable.salesArea = matchingStore.salesArea || null; // cell 4
      projectionsTable.year1Ending = Math.round(
        Number(salesGrowthProjection.firstYearAverageSales) * 0.001
      );
      projectionsTable.year2Ending = Math.round(
        Number(salesGrowthProjection.secondYearAverageSales) * 0.001
      );
      projectionsTable.year3Ending = Math.round(
        Number(salesGrowthProjection.thirdYearAverageSales) * 0.001
      );
      projectionsTable.comment = type;
    }

    formattedTables.projectionsTable = projectionsTable;

    ///////////////////////////////////////////////
    //////// CURRENT STORES WEEKLY SUMMARY ////////

    formattedTables.currentStoresWeeklySummary = json.storeList.filter(
      store => store.uniqueId
    );

    /////////////////////////////////////////////////
    //////// PROJECTED STORES WEEKLY SUMMARY ////////

    formattedTables.projectedStoresWeeklySummary = json.storeList.map(store => {
      const beforematch = json.projectedVolumesBefore.filter(
        j => j.mapKey === store.mapKey
      )[0];

      
      const aftermatch = json.projectedVolumesAfter.filter(
        j => j.mapKey === store.mapKey
      )[0];

      const currentSales = beforematch.currentSales;
      const futureSales = beforematch.futureSales;

      const contributionToSite =
        Number(beforematch.futureSales) - Number(aftermatch.futureSales);
      const contributionToSitePerc =
        (Number(contributionToSite) / Number(futureSales)) * 100;

      store['projectedSales'] =
        Math.round((Number(futureSales) - Number(contributionToSite)) / 1000) *
        1000;

      store['projectedSalesPSF'] = store['projectedSales'] / store.salesArea;

      return store;
    });

    ////////////////////////////////////////
    //////// SOURCE OF VOLUME (SOV) ////////

    formattedTables.sourceOfVolume.companyStores = json.storeList
      .filter(
        store =>
          store.category === 'Company Store' &&
          (store.uniqueId || store.mapKey === siteNumber)
      )
      .map(store => {
        const beforematch = json.projectedVolumesBefore.filter(
          j => j.mapKey === store.mapKey
        )[0];

        const aftermatch = json.projectedVolumesAfter.filter(
          j => j.mapKey === store.mapKey
        )[0];

        store['currentSales'] = beforematch.currentSales;

        store['futureSales'] = beforematch.futureSales;

        store['contributionToSite'] =
          Math.abs(Number(beforematch.futureSales) - Number(aftermatch.futureSales));
        store['contributionToSitePerc'] =
          (Number(store['contributionToSite']) / Number(store['futureSales'])) *
          100;

        store['resultingVolume'] = store.mapKey === matchingStore.mapKey ? aftermatch.futureSales :
          store['futureSales'] - store['contributionToSite'];

        store['distance'] =
          this.mapService.getDistanceBetween(
            { lat: store.latitude, lng: store.longitude },
            { lat: matchingStore.latitude, lng: matchingStore.longitude }
          ) * 0.000621371;

        formattedTables.sourceOfVolume.averages.companyStores.fitStorePower.values.push(
          store.effectivePower
        );
        formattedTables.sourceOfVolume.averages.companyStores.contributionToSite.values.push(
          store['contributionToSite']
        );

        return store;
      });

    formattedTables.sourceOfVolume.existingCompetition = json.storeList
      .filter(
        store =>
          store.category === 'Existing Competition' &&
          (store.uniqueId || store.mapKey === siteNumber)
      )
      .map(store => {
        const beforematch = json.projectedVolumesBefore.filter(
          j => j.mapKey === store.mapKey
        )[0];

        const aftermatch = json.projectedVolumesAfter.filter(
          j => j.mapKey === store.mapKey
        )[0];

        store['currentSales'] = beforematch.currentSales;

        store['futureSales'] = beforematch.futureSales;

        store['contributionToSite'] =
          Math.abs(Number(beforematch.futureSales) - Number(aftermatch.futureSales));
        store['contributionToSitePerc'] =
          (Number(store['contributionToSite']) / Number(store['futureSales'])) *
          100;
        store['resultingVolume'] =
          Number(store['futureSales']) - Number(store['contributionToSite']);

        store['distance'] =
          this.mapService.getDistanceBetween(
            { lat: store.latitude, lng: store.longitude },
            { lat: matchingStore.latitude, lng: matchingStore.longitude }
          ) * 0.000621371;

        formattedTables.sourceOfVolume.averages.existingCompetition.fitStorePower.values.push(
          store.effectivePower
        );
        formattedTables.sourceOfVolume.averages.existingCompetition.contributionToSite.values.push(
          store['contributionToSite']
        );
        return store;
      });

    formattedTables.sourceOfVolume.proposedCompetition = json.storeList
      .filter(
        store =>
          store.category === 'Proposed Competition' &&
          (store.uniqueId || store.mapKey === siteNumber)
      )
      .map(store => {
        const beforematch = json.projectedVolumesBefore.filter(
          j => j.mapKey === store.mapKey
        )[0];

        const aftermatch = json.projectedVolumesAfter.filter(
          j => j.mapKey === store.mapKey
        )[0];

        store['currentSales'] = beforematch.currentSales;

        store['futureSales'] = beforematch.futureSales;

        store['contributionToSite'] =
          Math.abs(Number(beforematch.futureSales) - Number(aftermatch.futureSales));
        store['contributionToSitePerc'] =
          (Number(store['contributionToSite']) / Number(store['futureSales'])) *
          100;
        store['resultingVolume'] =
          store['futureSales'] - store['contributionToSite'];

        store['distance'] =
          this.mapService.getDistanceBetween(
            { lat: store.latitude, lng: store.longitude },
            { lat: matchingStore.latitude, lng: matchingStore.longitude }
          ) * 0.000621371;

        formattedTables.sourceOfVolume.averages.proposedCompetition.fitStorePower.values.push(
          store.effectivePower
        );
        formattedTables.sourceOfVolume.averages.proposedCompetition.contributionToSite.values.push(
          store['contributionToSite']
        );
        return store;
      });

    if (
      formattedTables.sourceOfVolume.averages.companyStores.fitStorePower.values
        .length
    ) {
      formattedTables.sourceOfVolume.averages.companyStores.fitStorePower.average =
        formattedTables.sourceOfVolume.averages.companyStores.fitStorePower.values.reduce(
          (a, b) => a + b
        ) /
        formattedTables.sourceOfVolume.averages.companyStores.fitStorePower
          .values.length;
    }
    if (
      formattedTables.sourceOfVolume.averages.companyStores.contributionToSite.values
        .length
    ) {
      formattedTables.sourceOfVolume.averages.companyStores.contributionToSite.average =
        formattedTables.sourceOfVolume.averages.companyStores.contributionToSite.values.reduce(
          (a, b) => a + b
        ) /
        formattedTables.sourceOfVolume.averages.companyStores.contributionToSite
          .values.length;
    }

    if (
      formattedTables.sourceOfVolume.averages.existingCompetition.fitStorePower
        .values.length
    ) {
      formattedTables.sourceOfVolume.averages.existingCompetition.fitStorePower.average =
        formattedTables.sourceOfVolume.averages.existingCompetition.fitStorePower.values.reduce(
          (a, b) => a + b
        ) /
        formattedTables.sourceOfVolume.averages.existingCompetition
          .fitStorePower.values.length;
    }
    if (
      formattedTables.sourceOfVolume.averages.existingCompetition.contributionToSite
        .values.length
    ) {
      formattedTables.sourceOfVolume.averages.existingCompetition.contributionToSite.average =
        formattedTables.sourceOfVolume.averages.existingCompetition.contributionToSite.values.reduce(
          (a, b) => a + b
        ) /
        formattedTables.sourceOfVolume.averages.existingCompetition
          .contributionToSite.values.length;
    }

    if (
      formattedTables.sourceOfVolume.averages.proposedCompetition.fitStorePower
        .values.length
    ) {
      formattedTables.sourceOfVolume.averages.proposedCompetition.fitStorePower.average =
        formattedTables.sourceOfVolume.averages.proposedCompetition.fitStorePower.values.reduce(
          (a, b) => a + b
        ) /
        formattedTables.sourceOfVolume.averages.proposedCompetition
          .fitStorePower.values.length;
    }
    if (
      formattedTables.sourceOfVolume.averages.proposedCompetition.contributionToSite
        .values.length
    ) {
      formattedTables.sourceOfVolume.averages.proposedCompetition.contributionToSite.average =
        formattedTables.sourceOfVolume.averages.proposedCompetition.contributionToSite.values.reduce(
          (a, b) => a + b
        ) /
        formattedTables.sourceOfVolume.averages.proposedCompetition
          .contributionToSite.values.length;
    }

    formattedTables.targetStore = matchingStore

    console.log(formattedTables);
    return formattedTables;
  }
}
