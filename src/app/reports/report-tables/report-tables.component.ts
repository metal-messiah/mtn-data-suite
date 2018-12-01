import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';

import { saveAs } from 'file-saver';
import { ReportBuilderService } from '../services/report-builder.service';
import { JsonToTablesUtil } from './json-to-tables.util';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'mds-report-tables',
  templateUrl: './report-tables.component.html',
  styleUrls: ['./report-tables.component.css']
})
export class ReportTablesComponent implements OnInit {

  mapImageUrl: string;
  googleMapsKey = 'AIzaSyBwCet-oRMj-K7mUhd0kcX_0U1BW-xpKyQ';
  googleMapsBasemap = 'hybrid';
  googleMapsZoom = 15;

  tablesUtil: JsonToTablesUtil;

  tableDomIds: string[] = [
    'projectionsTable',
    'currentStoresWeeklySummaryTable',
    'projectedStoresWeeklySummaryTable',
    'sourceOfVolumeTable',
    'mapImage',
    'descriptionsRatings'
  ];

  constructor(public snackBar: MatSnackBar,
              public rbs: ReportBuilderService,
              public _location: Location,
              private router: Router,
              private errorService: ErrorService,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    if (!this.rbs.reportTableData) {
      setTimeout(() => {
        this.snackBar.open('No data has been loaded. Starting from the beginning', null, {duration: 5000});
        this.router.navigate(['reports']);
      }, 10)
    } else {
      this.tablesUtil = new JsonToTablesUtil(this.rbs);
      this.updateMapImageUrl();
      document.getElementById('reports-content-wrapper').scrollTop = 0;
    }
  }

  export() {
    this.rbs.compilingImages = true;
    this.rbs.getReportZip(this.getReportData())
      .pipe(finalize(() => this.rbs.compilingImages = false))
      .subscribe(blob => {
        saveAs(blob, `${this.rbs.reportMetaData.modelName}.zip`);
        this.router.navigate(['reports/download']);
      }, err => this.errorService.handleServerError('Failed to create zip file', err, null));
  }

  private getSovReportData() {
    return {
      firstYearEndDate: this.tablesUtil.tableData.firstYearEndingDate,
      fieldResDate: this.tablesUtil.reportMetaData.fieldResDate,
      openingDate: this.tablesUtil.tableData.storeOpeningDate,
      salesTransferFromCompanyStores: this.tablesUtil.getSalesTransfersFromCompanyStores(),
      salesTransferFromCompetition: this.tablesUtil.getSalesTransfersFromCompetition(),
      totalSalesTransfer: this.tablesUtil.getTotalSalesTransfers(),
      percentOfSalesExplainedAfterOneYear: this.tablesUtil.getPercentOfSalesExplained(),
      showingCount: this.tablesUtil.sovStores.length,
      totalCount: this.tablesUtil.sovStores.length + this.tablesUtil.sovOverflowStores.length,
      totalContributionExcluded: this.tablesUtil.getOverflowSum(),
      targetStoreMapKey: this.tablesUtil.targetStore.mapKey,
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
      fitAverage: this.tablesUtil.getSovFitAverageForCategory(category),
      contributionSum: this.tablesUtil.getSovContributionToSiteSubtotal(category)
    }
  }

  private getSovStoresForTable(category: string) {
    return this.tablesUtil.getSovStoresOfCategory(category)
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
          closing: store['closing']
        }
      })
  }

  private getReportData() {
    return {
      projections: this.getProjectionsTableData(),
      currentSummary: this.getCurrentSummaryTableData(),
      projectedSummary: this.getProjectedSummaryTableData(),
      sovData: this.getSovReportData(),
      mapUrl: this.mapImageUrl,
      ratings: this.tablesUtil.siteEvaluationRatings,
      narrativeData: this.getNarrativeData(),
      marketShareData: this.rbs.reportTableData.marketShareBySector,
      sovMapData: this.getSovMapData()
    }
  }

  private getProjectedSummaryTableData() {
    return {
      date: this.tablesUtil.tableData.firstYearEndingDate,
      stores: this.getProjectedSummaryStores(),
      summary: this.getProjectedSummaryAverages(),
      overflowCount: this.tablesUtil.currentWeeklyStoresOverflow.length
    }
  }

  private getProjectedSummaryStores() {
    return this.tablesUtil.projectedWeeklyStores.map(store => {
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
        isSite: store.mapKey === this.tablesUtil.targetStore.mapKey
      }
    })
  }

  private getProjectedSummaryAverages() {
    return {
      volume: this.tablesUtil.getSummaryAverage(this.tablesUtil.projectedWeeklyStores, 'projectedSales'),
      psf: this.tablesUtil.getSummaryAverage(this.tablesUtil.projectedWeeklyStores, 'projectedSalesPSF'),
      salesArea: this.tablesUtil.getSummaryAverage(this.tablesUtil.projectedWeeklyStores, 'salesArea'),
      power: this.tablesUtil.getSummaryAverage(this.tablesUtil.projectedWeeklyStores, 'effectivePower'),
    }
  }

  private getCurrentSummaryTableData() {
    return {
      date: this.tablesUtil.reportMetaData.fieldResDate,
      stores: this.getCurrentSummaryStores(),
      summary: this.getCurrentSummaryAverages(),
      overflowCount: this.tablesUtil.currentWeeklyStoresOverflow.length
    }
  }

  private getCurrentSummaryAverages() {
    return {
      volume: this.tablesUtil.getSummaryAverage(this.tablesUtil.currentWeeklyStores, 'actualSales'),
      psf: this.tablesUtil.getSummaryAverage(this.tablesUtil.currentWeeklyStores, 'actualSalesPSF'),
      salesArea: this.tablesUtil.getSummaryAverage(this.tablesUtil.currentWeeklyStores, 'salesArea'),
      power: this.tablesUtil.getSummaryAverage(this.tablesUtil.currentWeeklyStores, 'effectivePower'),
    }
  }

  private getCurrentSummaryStores() {
    return this.tablesUtil.currentWeeklyStores.map(store => {
      return {
        mapKey: store.mapKey,
        storeName: store.storeName,
        location: store.location,
        volume: store.actualSales,
        psf: store.actualSalesPSF,
        salesArea: store.salesArea,
        pwta: store.PWTA,
        fitPower: store.effectivePower
      }
    })
  }

  private getProjectionsTableData() {
    const ts = this.tablesUtil.targetStore;
    const sgps = this.tablesUtil.tableData.salesGrowthProjections;
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
      comment: this.tablesUtil.reportMetaData.type
    }
  }

  private getSovMapData() {

    const fieldResearchYear = this.rbs.reportMetaData.fieldResDate.getFullYear();
    const firstYearEndYear = this.tablesUtil.tableData.firstYearEndingDate.getFullYear();

    return this.tablesUtil.sovStores.map(s => {
      const obj = {
        mapKey: s.mapKey,
        latitude: s.latitude,
        longitude: s.longitude,
        category: s.category
      };
      obj[`currentSales${fieldResearchYear}`] = s['actualSales'];
      obj[`futureSales${firstYearEndYear}`] = s['futureSales'];
      obj['contributionToSite'] = s['contributionToSite'];
      obj['contributionToSitePerc'] = s['contributionToSitePerc'];
      obj['resultingVolume'] = s['closing'] ? s['resultingVolume'] : 0;
      return obj;
    });
  }

  private getNarrativeData() {
    let txt = '';

    Object.keys(this.tablesUtil.reportMetaData).forEach(key => {
      txt += `${key}:\r\n${this.tablesUtil.reportMetaData[key]}\r\n\r\n`
    });

    txt += `Store Name:\r\n${this.tablesUtil.targetStore.storeName}\r\n\r\n`;
    txt += `Map Key:\r\n${this.tablesUtil.targetStore.mapKey}\r\n\r\n`;

    Object.keys(this.tablesUtil.siteEvaluationNarrative).forEach(key => {
      txt += `${key}:\r\n${this.tablesUtil.siteEvaluationNarrative[key]}\r\n\r\n`
    });
    return txt;
  }

  updateMapImageUrl(basemap?: string, zoom?: number) {
    if (basemap) {
      this.googleMapsBasemap = basemap;
    }
    if (zoom) {
      this.googleMapsZoom = this.googleMapsZoom - zoom;
    }
    // map image
    const target = this.tablesUtil.targetStore;
    const targetPin = `&markers=color:red%7C${target.latitude},${target.longitude}`;

    const {latitude, longitude} = target;

    this.mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${
      this.googleMapsZoom
      }&size=470x350&maptype=${this.googleMapsBasemap}&${targetPin}&key=${
      this.googleMapsKey
      }`;
  }

}
