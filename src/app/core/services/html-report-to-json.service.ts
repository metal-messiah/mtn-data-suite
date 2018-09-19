import { Injectable } from '@angular/core';
import { HTMLasJSON } from '../../models/html-as-json';
import { StoreListItem } from '../../models/store-list-item';
import { VolumeItem } from '../../models/volume-item';
import { SalesGrowthProjectionItem } from '../../models/sales-growth-projection-item';
import { MarketShareBySectorItem } from '../../models/market-share-by-sector-item';
import { SectorListItem } from '../../models/sector-list-item';
import { ReportUploadInterface } from '../../reports/report-upload/report-upload-interface';

import { ProjectionsTable } from '../../models/projections-table';

import { MapService } from '../../core/services/map.service';
import { AuthService } from '../../core/services/auth.service';
import { StoreService } from '../../core/services/store.service';
import { Store } from '../../models/full/store';
import { BannerService } from '../../core/services/banner.service';
import { Banner } from '../../models/full/banner';

import { CompanyService } from '../../core/services/company.service';

import { Observable, Observer, of, Subject, forkJoin } from 'rxjs/index';

/*
  The HtmlReportToJson service should
  - create a json template
  - read an HTML string
  - parse this.tables inside HTML string to appropriate properties of json template
  - return json template object
 */
@Injectable()
export class HtmlReportToJsonService {
  parser: DOMParser;
  dom: Document;
  outputJSON: HTMLasJSON;
  tables: any;
  mapService: MapService;

  output$: Subject<HTMLasJSON>;

  constructor(
    public auth: AuthService,
    public storeService: StoreService,
    public bannerService: BannerService,
    public companyService: CompanyService
  ) {
    this.parser = new DOMParser();
    this.output$ = new Subject<HTMLasJSON>();
    this.mapService = new MapService(auth);
    
    this.companyService.getAllByQuery('').subscribe( res => console.log(res))
  }

  convertToNumber(s: String) {
    return s.replace(/[^0-9.]/g, '') !== ''
      ? Number(s.replace(/[^0-9.]/g, ''))
      : null;
  }

  formatString(s: String) {
    return s ? s.replace(/\n/g, ' ').replace(/ +(?= )/g, '') : null;
  }

  generateTables(modelData: ReportUploadInterface, json: HTMLasJSON) {

    

    const formattedTables = {
      projectionsTable: null,
      currentStoresWeeklySummary: null,
      sourceOfVolume: {
        companyStores: [],
        existingCompetition: [],
        proposedCompetition: []
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

    formattedTables.currentStoresWeeklySummary = json.storeList;

    ////////////////////////////////////////
    //////// SOURCE OF VOLUME (SOV) ////////

    formattedTables.sourceOfVolume.companyStores = json.storeList.filter(
      store =>
        (store.parentCompanyId === matchingStore.parentCompanyId &&
          matchingStore.parentCompanyId != null) ||
        (matchingStore.parentCompanyId == null &&
          store.storeName === matchingStore.storeName)
    );

    return formattedTables;
  }

  convertHTMLtoJSON(HTML_STRING) {
    this.dom = this.parser.parseFromString(HTML_STRING, 'text/html');
    this.outputJSON = new HTMLasJSON();
    this.tables = this.dom.getElementsByTagName('table'); // list of all table elements
    this.generateStoreList();
  }

  generateStoreList() {
    ////////////////////////////
    //////// STORE LIST ////////

    const storeList1Rows = this.tables[0].children[2].children;
    for (let i = 0; i < storeList1Rows.length; i++) {
      const storeListItem = new StoreListItem();
      const cells = storeList1Rows[i].children; // array containing each cell of current row
      if (
        cells[1].firstElementChild.firstElementChild.innerHTML !== '&nbsp;' &&
        cells.length > 1
      ) {
        storeListItem.storeName = this.formatString(
          cells[0].firstElementChild.firstElementChild.innerHTML
        );
        storeListItem.mapKey = this.formatString(
          cells[1].firstElementChild.firstElementChild.innerHTML
        );
        storeListItem.uniqueId = this.convertToNumber(
          cells[2].firstElementChild.firstElementChild.innerHTML
        );
        storeListItem.latitude = this.convertToNumber(
          cells[3].firstElementChild.firstElementChild.innerHTML
        );
        storeListItem.longitude = this.convertToNumber(
          cells[4].firstElementChild.firstElementChild.innerHTML
        );
        storeListItem.salesArea = this.convertToNumber(
          cells[5].firstElementChild.firstElementChild.innerHTML
        );
        storeListItem.totalSize = Math.round(
          Number(storeListItem.salesArea) / 0.72
        );
        storeListItem.actualSales = this.convertToNumber(
          cells[6].firstElementChild.firstElementChild.innerHTML
        );
        storeListItem.actualSalesPSF =
          Number(storeListItem.actualSales) / Number(storeListItem.salesArea);

        storeListItem.parentCompanyId = null;

        storeListItem.marketShare = this.convertToNumber(
          cells[7].firstElementChild.firstElementChild.innerHTML
        );
        this.outputJSON.storeList.push(storeListItem);
      }
    }

    const storeList2Rows = this.tables[1].children[2].children;
    for (let i = 0; i < storeList2Rows.length; i++) {
      const storeListItem = this.outputJSON.storeList[i];
      const cells = storeList2Rows[i].children; // array containing each cell of current row
      if (
        cells[1].firstElementChild.firstElementChild.innerHTML !== '&nbsp;' &&
        cells.length > 1
      ) {
        storeListItem.effectivePower = this.convertToNumber(
          cells[2].firstElementChild.firstElementChild.innerHTML
        );
        storeListItem.curve = this.convertToNumber(
          cells[3].firstElementChild.firstElementChild.innerHTML
        );
        storeListItem.PWTA = this.convertToNumber(
          cells[4].firstElementChild.firstElementChild.innerHTML
        );
      }
    }

    const storeList3Rows = this.tables[2].children[2].children;
    for (let i = 0; i < storeList3Rows.length; i++) {
      const storeListItem = this.outputJSON.storeList[i];
      const cells = storeList3Rows[i].children; // array containing each cell of current row
      if (
        cells[1].firstElementChild.firstElementChild.innerHTML !== '&nbsp;' &&
        cells.length > 1
      ) {
        storeListItem.location = this.formatString(
          cells[2].firstElementChild.firstElementChild.innerHTML
        );
      }
    }

    const simpleBannerObservables = [];
    const bannerObservables = [];
    const hasBanner = {};

    this.outputJSON.storeList.forEach(storeListItem => {
      simpleBannerObservables.push(
        this.bannerService.getAllByQuery(storeListItem.storeName)
      );
    });

    if (simpleBannerObservables.length) {
      forkJoin(simpleBannerObservables).subscribe(simpleBanners => {
        console.log('SIMPLE BANNERS', simpleBanners);
        simpleBanners.forEach(simpleBanner => {
          if (simpleBanner.totalElements) {
            const bestBanner = simpleBanner.content[0];
            hasBanner[bestBanner.id] = bestBanner.bannerName;
            bannerObservables.push(
              this.bannerService.getOneById(bestBanner.id)
            );
          }
        });

        console.log(hasBanner);

        forkJoin(bannerObservables).subscribe(banners => {
          console.log('BANNERS', banners);
          banners.forEach(banner => {
            if (banner.company.parentCompany) {
              // console.log(banner.company.parentCompany)
              const storeQuery = hasBanner[banner.id];
              console.log(storeQuery);
              const idx = this.outputJSON.storeList.findIndex(s =>
                s.storeName.includes(storeQuery)
              );
              console.log(idx);
              if (idx !== -1) {
                const obj = this.outputJSON.storeList[idx];
                obj.parentCompanyId = banner.company.parentCompany.id;
                this.outputJSON.storeList[idx] = obj;
              }
            }
          });

          this.generateProjectedBefore();
        });
      });
    } else {
      this.generateProjectedBefore();
    }

    // this.outputJSON.storeList.forEach(storeListItem => {
    //   if (storeListItem.uniqueId) {
    //     storeObservables.push(
    //       this.storeService.getOneById(storeListItem.uniqueId)
    //     );
    //   }
    // });

    // if (storeObservables.length) {
    //   forkJoin(storeObservables).subscribe(stores => {
    //     stores.forEach(store => {
    //       if (store.banner) {
    //         if (store.banner.id) {
    //           hasBanner[store.banner.id] = store.id;
    //           bannerObservables.push(
    //             this.bannerService.getOneById(store.banner.id)
    //           );
    //         }
    //       }
    //     });

    //     forkJoin(bannerObservables).subscribe(banners => {
    //       banners.forEach(banner => {
    //         if (banner.company.parentCompany) {
    //           // console.log(banner.company.parentCompany)
    //           const storeId = hasBanner[banner.id];
    //           const idx = this.outputJSON.storeList.findIndex(
    //             s => s.uniqueId === storeId
    //           );
    //           const obj = this.outputJSON.storeList[idx];
    //           obj.parentCompanyId = banner.company.parentCompany.id;
    //           this.outputJSON.storeList[idx] = obj;
    //         }
    //       });

    //       this.generateProjectedBefore();
    //     });
    //   });
    // } else {
    //   this.generateProjectedBefore();
    // }
  }

  generateProjectedBefore() {
    //////////////////////////////////////////
    //////// PROJECTED VOLUMES BEFORE ////////

    const projectedBefore1Rows = this.tables[3].children[2].children;
    for (let i = 0; i < projectedBefore1Rows.length; i++) {
      const volumeItem = new VolumeItem();
      const cells = projectedBefore1Rows[i].children; // array containing each cell of current row
      if (
        cells[1].firstElementChild.firstElementChild.innerHTML !== '&nbsp;' &&
        cells.length > 1
      ) {
        volumeItem.storeName = this.formatString(
          cells[0].firstElementChild.firstElementChild.innerHTML
        );
        volumeItem.mapKey = this.formatString(
          cells[1].firstElementChild.firstElementChild.innerHTML
        );
        volumeItem.salesArea = this.convertToNumber(
          cells[2].firstElementChild.firstElementChild.innerHTML
        );
        volumeItem.currentSales = this.convertToNumber(
          cells[3].firstElementChild.firstElementChild.innerHTML
        );
        volumeItem.futureSales = this.convertToNumber(
          cells[4].firstElementChild.firstElementChild.innerHTML
        );
        volumeItem.salesPSF = this.convertToNumber(
          cells[5].firstElementChild.firstElementChild.innerHTML
        );
        volumeItem.PWTA = this.convertToNumber(
          cells[6].firstElementChild.firstElementChild.innerHTML
        );
        volumeItem.effectivePower = this.convertToNumber(
          cells[7].firstElementChild.firstElementChild.innerHTML
        );
        volumeItem.taChange = this.convertToNumber(
          cells[8].firstElementChild.firstElementChild.innerHTML
        );
        this.outputJSON.projectedVolumesBefore.push(volumeItem);
      }
    }

    const projectedBefore2Rows = this.tables[4].children[2].children;
    for (let i = 0; i < projectedBefore2Rows.length; i++) {
      const volumeItem = this.outputJSON.projectedVolumesBefore[i];
      const cells = projectedBefore2Rows[i].children; // array containing each cell of current row
      if (
        cells[1].firstElementChild.firstElementChild.innerHTML !== '&nbsp;' &&
        cells.length > 1
      ) {
        volumeItem.taChangePerc = this.convertToNumber(
          cells[2].firstElementChild.firstElementChild.innerHTML
        );
      }
    }

    const projectedBefore3Rows = this.tables[5].children[2].children;
    for (let i = 0; i < projectedBefore3Rows.length; i++) {
      const volumeItem = this.outputJSON.projectedVolumesBefore[i];
      const cells = projectedBefore3Rows[i].children; // array containing each cell of current row
      if (
        cells[1].firstElementChild.firstElementChild.innerHTML !== '&nbsp;' &&
        cells.length > 1
      ) {
        volumeItem.location = this.formatString(
          cells[2].firstElementChild.firstElementChild.innerHTML
        );
      }
    }

    this.generateProjectedAfter();
  }

  generateProjectedAfter() {
    /////////////////////////////////////////
    //////// PROJECTED VOLUMES AFTER ////////

    const projectedAfter1Rows = this.tables[6].children[2].children;
    for (let i = 0; i < projectedAfter1Rows.length; i++) {
      const volumeItem = new VolumeItem();
      const cells = projectedAfter1Rows[i].children; // array containing each cell of current row
      if (
        cells[1].firstElementChild.firstElementChild.innerHTML !== '&nbsp;' &&
        cells.length > 1
      ) {
        volumeItem.storeName = this.formatString(
          cells[0].firstElementChild.firstElementChild.innerHTML
        );
        volumeItem.mapKey = this.formatString(
          cells[1].firstElementChild.firstElementChild.innerHTML
        );
        volumeItem.salesArea = this.convertToNumber(
          cells[2].firstElementChild.firstElementChild.innerHTML
        );
        volumeItem.currentSales = this.convertToNumber(
          cells[3].firstElementChild.firstElementChild.innerHTML
        );
        volumeItem.futureSales = this.convertToNumber(
          cells[4].firstElementChild.firstElementChild.innerHTML
        );
        volumeItem.salesPSF = this.convertToNumber(
          cells[5].firstElementChild.firstElementChild.innerHTML
        );
        volumeItem.PWTA = this.convertToNumber(
          cells[6].firstElementChild.firstElementChild.innerHTML
        );
        volumeItem.effectivePower = this.convertToNumber(
          cells[7].firstElementChild.firstElementChild.innerHTML
        );
        volumeItem.taChange = this.convertToNumber(
          cells[8].firstElementChild.firstElementChild.innerHTML
        );
        this.outputJSON.projectedVolumesAfter.push(volumeItem);
      }
    }

    const projectedAfter2Rows = this.tables[7].children[2].children;
    for (let i = 0; i < projectedAfter2Rows.length; i++) {
      const volumeItem = this.outputJSON.projectedVolumesAfter[i];
      const cells = projectedAfter2Rows[i].children; // array containing each cell of current row
      if (
        cells[1].firstElementChild.firstElementChild.innerHTML !== '&nbsp;' &&
        cells.length > 1
      ) {
        volumeItem.taChangePerc = this.convertToNumber(
          cells[2].firstElementChild.firstElementChild.innerHTML
        );
      }
    }

    const projectedAfter3Rows = this.tables[8].children[2].children;
    for (let i = 0; i < projectedAfter3Rows.length; i++) {
      const volumeItem = this.outputJSON.projectedVolumesAfter[i];
      const cells = projectedAfter3Rows[i].children; // array containing each cell of current row
      if (
        cells[1].firstElementChild.firstElementChild.innerHTML !== '&nbsp;' &&
        cells.length > 1
      ) {
        volumeItem.location = this.formatString(
          cells[2].firstElementChild.firstElementChild.innerHTML
        );
      }
    }

    this.generateSalesGrowthProjection();
  }

  generateSalesGrowthProjection() {
    /////////////////////////////////////////
    //////// Sales Growth Projection ////////

    const salesGrowthProjection1Rows = this.tables[9].children[1].children;
    const sgpMapping = {
      first: [],
      second: [],
      third: [],
      fourth: [],
      fifth: []
    };
    for (let i = 0; i < salesGrowthProjection1Rows.length; i++) {
      const cells = salesGrowthProjection1Rows[i].children; // array containing each cell of current row

      if (cells[1].firstElementChild.firstElementChild.innerHTML !== '&nbsp;') {
        if (
          cells[0].firstElementChild.firstElementChild.innerHTML.includes(
            'First'
          )
        ) {
          sgpMapping.first.push({
            sales: this.convertToNumber(
              cells[1].firstElementChild.firstElementChild.innerHTML
            ),
            salesPSF: this.convertToNumber(
              cells[3].firstElementChild.firstElementChild.innerHTML
            )
          });
        }
        if (
          cells[0].firstElementChild.firstElementChild.innerHTML.includes(
            'Second'
          )
        ) {
          sgpMapping.second.push({
            sales: this.convertToNumber(
              cells[1].firstElementChild.firstElementChild.innerHTML
            ),
            salesPSF: this.convertToNumber(
              cells[3].firstElementChild.firstElementChild.innerHTML
            )
          });
        }
        if (
          cells[0].firstElementChild.firstElementChild.innerHTML.includes(
            'Third'
          )
        ) {
          sgpMapping.third.push({
            sales: this.convertToNumber(
              cells[1].firstElementChild.firstElementChild.innerHTML
            ),
            salesPSF: this.convertToNumber(
              cells[3].firstElementChild.firstElementChild.innerHTML
            )
          });
        }
        if (
          cells[0].firstElementChild.firstElementChild.innerHTML.includes(
            'Fourth'
          )
        ) {
          sgpMapping.fourth.push({
            sales: this.convertToNumber(
              cells[1].firstElementChild.firstElementChild.innerHTML
            ),
            salesPSF: this.convertToNumber(
              cells[3].firstElementChild.firstElementChild.innerHTML
            )
          });
        }
        if (
          cells[0].firstElementChild.firstElementChild.innerHTML.includes(
            'Fifth'
          )
        ) {
          sgpMapping.fifth.push({
            sales: this.convertToNumber(
              cells[1].firstElementChild.firstElementChild.innerHTML
            ),
            salesPSF: this.convertToNumber(
              cells[3].firstElementChild.firstElementChild.innerHTML
            )
          });
        }
      }
    }

    for (let i = 0; i < sgpMapping.first.length; i++) {
      const { first, second, third, fourth, fifth } = sgpMapping;
      const salesGrowthProjectionItem = new SalesGrowthProjectionItem(
        first[i].sales,
        first[i].salesPSF,
        second[i].sales,
        second[i].salesPSF,
        third[i].sales,
        third[i].salesPSF,
        fourth[i].sales,
        fourth[i].salesPSF,
        fifth[i].sales,
        fifth[i].salesPSF
      );
      this.outputJSON.salesGrowthProjection.push(salesGrowthProjectionItem);
    }

    this.generateMarketShareBySector();
  }

  generateMarketShareBySector() {
    ////////////////////////////////////////
    //////// MARKET SHARE BY SECTOR ////////

    const marketShareBySector1Rows = this.tables[10].children[2].children;
    for (let i = 0; i < marketShareBySector1Rows.length; i++) {
      const marketShareBySectorItem = new MarketShareBySectorItem();
      const cells = marketShareBySector1Rows[i].children; // array containing each cell of current row
      if (
        cells[0].firstElementChild.firstElementChild.innerHTML !== '&nbsp;' &&
        cells.length > 2
      ) {
        marketShareBySectorItem.sector = this.formatString(
          cells[0].firstElementChild.firstElementChild.innerHTML
        );
        marketShareBySectorItem.projectedSales = this.convertToNumber(
          cells[1].firstElementChild.firstElementChild.innerHTML
        );
        marketShareBySectorItem.projectedMS = this.convertToNumber(
          cells[2].firstElementChild.firstElementChild.innerHTML
        );
        marketShareBySectorItem.effectivePower = this.convertToNumber(
          cells[3].firstElementChild.firstElementChild.innerHTML
        );
        marketShareBySectorItem.futurePop1 = this.convertToNumber(
          cells[4].firstElementChild.firstElementChild.innerHTML
        );
        marketShareBySectorItem.projectedPotential = this.convertToNumber(
          cells[5].firstElementChild.firstElementChild.innerHTML
        );
        marketShareBySectorItem.projectedPCW = this.convertToNumber(
          cells[6].firstElementChild.firstElementChild.innerHTML
        );
        marketShareBySectorItem.leakage = this.convertToNumber(
          cells[7].firstElementChild.firstElementChild.innerHTML
        );
        marketShareBySectorItem.distribution = this.convertToNumber(
          cells[8].firstElementChild.firstElementChild.innerHTML
        );
        marketShareBySectorItem.futurePop2 = this.convertToNumber(
          cells[9].firstElementChild.firstElementChild.innerHTML
        );
        marketShareBySectorItem.futurePop3 = this.convertToNumber(
          cells[10].firstElementChild.firstElementChild.innerHTML
        );
        this.outputJSON.marketShareBySector.push(marketShareBySectorItem);
      }
    }

    this.generateSectorList();
  }

  generateSectorList() {
    /////////////////////////////
    //////// SECTOR LIST ////////

    const sectorList1Rows = this.tables[11].children[2].children;
    for (let i = 0; i < sectorList1Rows.length; i++) {
      const sectorListItem = new SectorListItem();
      const cells = sectorList1Rows[i].children; // array containing each cell of current row
      if (
        cells[0].firstElementChild.firstElementChild.innerHTML !== '&nbsp;' &&
        cells.length > 1
      ) {
        sectorListItem.sector = this.formatString(
          cells[0].firstElementChild.firstElementChild.innerHTML
        );
        sectorListItem.name = this.formatString(
          cells[1].firstElementChild.firstElementChild.innerHTML
        );

        sectorListItem.latitude = this.convertToNumber(
          cells[2].firstElementChild.firstElementChild.innerHTML
        );
        sectorListItem.longitude = this.convertToNumber(
          cells[3].firstElementChild.firstElementChild.innerHTML
        );
        sectorListItem.pop = this.convertToNumber(
          cells[4].firstElementChild.firstElementChild.innerHTML
        );
        sectorListItem.PCW = this.convertToNumber(
          cells[5].firstElementChild.firstElementChild.innerHTML
        );
        sectorListItem.leakage = this.convertToNumber(
          cells[6].firstElementChild.firstElementChild.innerHTML
        );

        this.outputJSON.sectorList.push(sectorListItem);
      }
    }

    this.sendResult();
  }

  sendResult() {
    this.output$.next(this.outputJSON);
  }
}
