import { Injectable } from '@angular/core';
import { ReportData } from '../../models/report-data';
import { StoreListItem } from '../../models/store-list-item';
import { VolumeItem } from '../../models/volume-item';
import { SalesGrowthProjectionItem } from '../../models/sales-growth-projection-item';
import { MarketShareBySectorItem } from '../../models/market-share-by-sector-item';
import { SectorListItem } from '../../models/sector-list-item';

import { AuthService } from './auth.service';

import { Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material';

/*
  The HtmlToModelParser service should
  - create a json template
  - read an HTML string
  - parse this.tables inside HTML string to appropriate properties of json template
  - return json template object
 */
@Injectable()
export class HtmlToModelParser {
  parser: DOMParser;
  dom: Document;

  output$: Subject<ReportData>;

  storeFieldsMap = {
    StoreName: {name: 'storeName', type: 'string'},
    MapKey: {name: 'mapKey', type: 'string'},
    UniqueID: {name: 'uniqueId', type: 'number'},
    Latitude: {name: 'latitude', type: 'number'},
    Longitude: {name: 'longitude', type: 'number'},
    Area: {name: 'salesArea', type: 'number'},
    Sales: {name: 'actualSales', type: 'number'},
    Share: {name: 'marketShare', type: 'number'},
    Power: {name: 'effectivePower', type: 'number'},
    Curve: {name: 'curve', type: 'number'},
    PWTA: {name: 'PWTA', type: 'number'},
    Location: {name: 'location', type: 'string'}
  };

  volumeFieldsMap = {
    StoreName: {name: 'storeName', type: 'string'},
    MapKey: {name: 'mapKey', type: 'string'},
    Area: {name: 'salesArea', type: 'number'},
    Sales: {name: 'currentSales', type: 'number'},
    FutureSales: {name: 'futureSales', type: 'number'},
    SqFt: {name: 'salesPSF', type: 'number'},
    PWTA: {name: 'PWTA', type: 'number'},
    Power: {name: 'effectivePower', type: 'number'},
    Change: {name: 'taChange', type: 'number'},
    'Change%': {name: 'taChangePerc', type: 'number'},
    Location: {name: 'location', type: 'string'}
  };

  constructor(
    public auth: AuthService,
    public snackBar: MatSnackBar
  ) {
    this.parser = new DOMParser();
    this.output$ = new Subject<ReportData>();
  }

  parseHtml(HTML_STRING): Observable<ReportData> {
    return Observable.create(observer => {
      const reportData = new ReportData();
      this.dom = this.parser.parseFromString(HTML_STRING, 'text/html');
      const tables = this.dom.getElementsByTagName('table'); // list of all table elements
      this.generateStoreList(reportData, tables, 0, null);
      observer.next(reportData);
      observer.complete();
    });
  }

  private convertToNumber(s: String) {
    return s.replace(/[^0-9.-]/g, '') !== ''
      ? Number(s.replace(/[^0-9.-]/g, ''))
      : null;
  }

  private formatString(s: String) {
    return s
      ? s
        .replace(/\n/g, ' ')
        .replace(/ +(?= )/g, '')
        .replace(/&amp;/g, '&')
      : null;
  }

  private getCellText(cells: Element[], cellNum: number) {
    return cells[cellNum].firstElementChild.firstElementChild.innerHTML;
  }

  private determineTableType(table) {
    const firstHeaderCell = table.children[1].children[0].children[0];

    if (!firstHeaderCell.innerText.trim()) {
      const titleElem =
        table.previousElementSibling.previousElementSibling
          .previousElementSibling;

      if (titleElem.tagName === 'P' && titleElem.innerText && titleElem.innerText !== ' ') {
        return titleElem.innerText.replace(/\s+/g, ' ');
      }
      return null;
    } else {
      return firstHeaderCell.innerText.replace(/\s+/g, ' ');
    }
  }

  private generateStoreList(reportData: ReportData, tables, currentTableIndex, currentTableType) {
    ////////////////////////////
    //////// STORE LIST ////////
    const tableType = this.determineTableType(tables[currentTableIndex]);
    currentTableType = tableType ? tableType : currentTableType;

    if (currentTableType === 'Store List') {
      // console.log('build stores');
      const storeListHeader = tables[currentTableIndex].children[1].children[1].children;

      const storeListFields = {};

      for (let i = 0; i < storeListHeader.length; i++) {
        const fieldName = storeListHeader[i].innerText.replace(/\s+/g, '');
        storeListFields[i] = this.storeFieldsMap[fieldName];
      }

      const storeListRows = tables[currentTableIndex].children[2].children;
      for (let i = 0; i < storeListRows.length; i++) {
        const storeListItem = reportData.storeList[i] ? reportData.storeList[i] : new StoreListItem();
        const cells = storeListRows[i].children; // array containing each cell of current row

        if (cells.length > 1 && this.getCellText(cells, 1) !== '&nbsp;') {
          for (let j = 0; j < cells.length; j++) {
            const cellText = this.getCellText(cells, j);
            storeListItem[storeListFields[j].name] =
              storeListFields[j].type === 'string' ? this.formatString(cellText) : this.convertToNumber(cellText);
          }
          if (!reportData.storeList[i]) {
            reportData.storeList.push(storeListItem);
          }
        }
      }
      this.generateStoreList(reportData, tables, currentTableIndex + 1, currentTableType);
    } else {
      reportData.storeList.forEach(storeListItem => {
        storeListItem.parentCompanyId = null;
        storeListItem.actualSalesPSF = Number(storeListItem.actualSales) / Number(storeListItem.salesArea);
        // storeListItem.totalSize = Math.round(Number(storeListItem.salesArea) / 0.72);
      });
      this.generateProjectedBefore(reportData, tables, currentTableIndex, null);
    }
  }

  private generateProjectedBefore(reportData: ReportData, tables, currentTableIndex: number, currentTableType: string) {
    //////////////////////////////////////////
    //////// PROJECTED VOLUMES BEFORE ////////
    const t = this.determineTableType(tables[currentTableIndex]);
    if (t) {
      if (t !== currentTableType) {
        currentTableType = t;
      } else {
        currentTableType = currentTableType + '_2'
      }
    }

    if (currentTableType === 'Projected Volumes') {
      const header = tables[currentTableIndex].children[1].children[1].children;

      const volumeListFields = {};
      let matchedSales = false;

      for (let i = 0; i < header.length; i++) {
        let text = header[i].innerText.replace(/\s+/g, '').replace('/', '').replace(/\./g, '');
        if (text === 'Sales') {
          if (matchedSales) {
            text = 'FutureSales';
            const firstHeader = tables[currentTableIndex].children[1].children[0].children;
            reportData.firstYearEndingMonthYear = this.formatString(firstHeader[i].innerText).trim();
          } else {
            matchedSales = true;
          }
        }
        volumeListFields[i] = this.volumeFieldsMap[text];
      }

      const volumeListRows = tables[currentTableIndex].children[2].children;
      for (let i = 0; i < volumeListRows.length; i++) {
        const volumeListItem = reportData.projectedVolumesBefore[i]
          ? reportData.projectedVolumesBefore[i]
          : new VolumeItem();
        const cells = volumeListRows[i].children; // array containing each cell of current row

        if (this.getCellText(cells, 1) !== '&nbsp;' && cells.length > 1) {
          for (let j = 0; j < cells.length; j++) {
            const cellText = this.getCellText(cells, j);
            volumeListItem[volumeListFields[j].name] =
              volumeListFields[j].type === 'string'
                ? this.formatString(cellText)
                : this.convertToNumber(cellText);
          }
          if (!reportData.projectedVolumesBefore[i]) {
            reportData.projectedVolumesBefore.push(volumeListItem);
          } else {
            reportData.projectedVolumesBefore[i] = volumeListItem;
          }
        }
      }

      this.generateProjectedBefore(reportData, tables, currentTableIndex + 1, currentTableType);
    } else {
      this.generateProjectedAfter(reportData, tables, currentTableIndex, currentTableType);
    }
  }

  private generateProjectedAfter(reportData: ReportData, tables, currentTableIndex: number, currentTableType: string) {
    /////////////////////////////////////////
    //////// PROJECTED VOLUMES AFTER ////////
    const t = this.determineTableType(tables[currentTableIndex]);
    currentTableType = t ? t : currentTableType;

    if (currentTableType === 'Projected Volumes') {
      const header = tables[currentTableIndex].children[1].children[1].children;

      const volumeListFields = {};
      let matchedSales = false;

      for (let i = 0; i < header.length; i++) {
        let text = header[i].innerText
          .replace(/\s+/g, '')
          .replace('/', '')
          .replace(/\./g, '');

        if (text === 'Sales') {
          if (matchedSales) {
            text = 'FutureSales';
          } else {
            matchedSales = true;
          }
        }

        volumeListFields[i] = this.volumeFieldsMap[text];
      }

      const volumeListRows = tables[currentTableIndex].children[2].children;
      for (let i = 0; i < volumeListRows.length; i++) {
        const volumeListItem = reportData.projectedVolumesAfter[i] ? reportData.projectedVolumesAfter[i] : new VolumeItem();
        const cells = volumeListRows[i].children; // array containing each cell of current row

        if (this.getCellText(cells, 1) !== '&nbsp;' && cells.length > 1) {
          for (let j = 0; j < cells.length; j++) {
            const cellText = this.getCellText(cells, j);
            volumeListItem[volumeListFields[j].name] =
              volumeListFields[j].type === 'string' ? this.formatString(cellText) : this.convertToNumber(cellText);
          }
          if (!reportData.projectedVolumesAfter[i]) {
            reportData.projectedVolumesAfter.push(volumeListItem);
          } else {
            reportData.projectedVolumesAfter[i] = volumeListItem;
          }
        }
      }
      this.generateProjectedAfter(reportData, tables, currentTableIndex + 1, currentTableType);
    } else {
      this.generateSalesGrowthProjection(reportData, tables, currentTableIndex);
    }
  }

  private generateSalesGrowthProjection(reportData: ReportData, tables, currentTableIndex: number) {
    /////////////////////////////////////////
    //////// Sales Growth Projection ////////

    const salesGrowthProjection1Rows = tables[currentTableIndex].children[1].children;
    const sgpMapping = {
      first: [],
      second: [],
      third: [],
      fourth: [],
      fifth: []
    };

    for (let i = 0; i < salesGrowthProjection1Rows.length; i++) {
      const cells = salesGrowthProjection1Rows[i].children; // array containing each cell of current row

      const firstCellIncludes = (searchString: string) => this.getCellText(cells, 0).includes(searchString);
      const getSalesAndPsf = () => {
        return {
          sales: this.convertToNumber(this.getCellText(cells, 1)),
          salesPSF: this.convertToNumber(this.getCellText(cells, 3))
        }
      };

      if (this.getCellText(cells, 1) !== '&nbsp;') {
        if (firstCellIncludes('First')) {
          sgpMapping.first.push(getSalesAndPsf());
        } else if (firstCellIncludes('Second')) {
          sgpMapping.second.push(getSalesAndPsf());
        } else if (firstCellIncludes('Third')) {
          sgpMapping.third.push(getSalesAndPsf());
        } else if (firstCellIncludes('Fourth')) {
          sgpMapping.fourth.push(getSalesAndPsf());
        } else if (firstCellIncludes('Fifth')) {
          sgpMapping.fifth.push(getSalesAndPsf());
        }
      } else if (firstCellIncludes('Store') && firstCellIncludes(':')) {
        const text = this.getCellText(cells, 0);
        const regex = /^.*Store\s([\d.]+):.*/;
        const match = regex.exec(text);
        reportData.selectedMapKey = parseFloat(match[1]);
      }
    }

    for (let i = 0; i < sgpMapping.first.length; i++) {
      const {first, second, third, fourth, fifth} = sgpMapping;
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
      reportData.salesGrowthProjection.push(salesGrowthProjectionItem);
    }
    this.generateMarketShareBySector(reportData, tables, currentTableIndex + 1);
  }

  private generateMarketShareBySector(reportData: ReportData, tables, currentTableIndex: number) {
    ////////////////////////////////////////
    //////// MARKET SHARE BY SECTOR ////////

    // TODO Parse out selectedMapKey from header row
    const marketShareBySector1Rows = tables[currentTableIndex].children[2].children;
    for (let i = 0; i < marketShareBySector1Rows.length; i++) {
      const marketShareBySectorItem = new MarketShareBySectorItem();
      const cells = marketShareBySector1Rows[i].children; // array containing each cell of current row

      if (this.getCellText(cells, 0) !== '&nbsp;' && cells.length > 2) {
        marketShareBySectorItem.sector = this.convertToNumber(this.getCellText(cells, 0));
        marketShareBySectorItem.projectedSales = this.convertToNumber(this.getCellText(cells, 1));
        marketShareBySectorItem.projectedMS = this.convertToNumber(this.getCellText(cells, 2));
        marketShareBySectorItem.effectivePower = this.convertToNumber(this.getCellText(cells, 3));
        marketShareBySectorItem.futurePop1 = this.convertToNumber(this.getCellText(cells, 4));
        marketShareBySectorItem.projectedPotential = this.convertToNumber(this.getCellText(cells, 5));
        marketShareBySectorItem.projectedPCW = this.convertToNumber(this.getCellText(cells, 6));
        marketShareBySectorItem.leakage = this.convertToNumber(this.getCellText(cells, 7));
        marketShareBySectorItem.distribution = this.convertToNumber(this.getCellText(cells, 8));
        marketShareBySectorItem.futurePop2 = this.convertToNumber(this.getCellText(cells, 9));
        marketShareBySectorItem.futurePop3 = this.convertToNumber(this.getCellText(cells, 10));
        reportData.marketShareBySector.push(marketShareBySectorItem);
      }
    }
    this.generateSectorList(reportData, tables, currentTableIndex + 1);
  }

  private generateSectorList(reportData: ReportData, tables, currentTableIndex: number) {
    /////////////////////////////
    //////// SECTOR LIST ////////

    const sectorList1Rows = tables[currentTableIndex].children[2].children;
    for (let i = 0; i < sectorList1Rows.length; i++) {
      const sectorListItem = new SectorListItem();
      const cells = sectorList1Rows[i].children; // array containing each cell of current row

      if (this.getCellText(cells, 0) !== '&nbsp;' && cells.length > 1) {
        sectorListItem.sector = this.convertToNumber(this.getCellText(cells, 0));
        sectorListItem.name = this.formatString(this.getCellText(cells, 1));
        sectorListItem.latitude = this.convertToNumber(this.getCellText(cells, 2));
        sectorListItem.longitude = this.convertToNumber(this.getCellText(cells, 3));
        sectorListItem.pop = this.convertToNumber(this.getCellText(cells, 4));
        sectorListItem.PCW = this.convertToNumber(this.getCellText(cells, 5));
        sectorListItem.leakage = this.convertToNumber(this.getCellText(cells, 6));

        reportData.sectorList.push(sectorListItem);
      }
    }
  }

}
