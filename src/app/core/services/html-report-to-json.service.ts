import { Injectable } from '@angular/core';
import { HTMLasJSON } from '../../models/html-as-json';
import { StoreListItem } from '../../models/store-list-item';
import { VolumeItem } from '../../models/volume-item';
import { SalesGrowthProjectionItem } from '../../models/sales-growth-projection-item';
import { MarketShareBySectorItem } from '../../models/market-share-by-sector-item';
import { SectorListItem } from '../../models/sector-list-item';
import { ReportUploadInterface } from '../../reports/report-upload/report-upload-interface';

import { AuthService } from './auth.service';
import { StoreService } from './store.service';

import { Subject } from 'rxjs';
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { MatSnackBar } from '@angular/material';

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

  output$: Subject<HTMLasJSON>;

  inputData: ReportUploadInterface;

  currentTableType: string = null;
  currentTableIndex = 0;

  storeFieldsMap = {
    StoreName: { name: 'storeName', type: 'string' },
    MapKey: { name: 'mapKey', type: 'string' },
    UniqueID: { name: 'uniqueId', type: 'number' },
    Latitude: { name: 'latitude', type: 'number' },
    Longitude: { name: 'longitude', type: 'number' },
    Area: { name: 'salesArea', type: 'number' },
    Sales: { name: 'actualSales', type: 'number' },
    Share: { name: 'marketShare', type: 'number' },
    Power: { name: 'effectivePower', type: 'number' },
    Curve: { name: 'curve', type: 'number' },
    PWTA: { name: 'PWTA', type: 'number' },
    Location: { name: 'location', type: 'string' }
  };

  volumeFieldsMap = {
    StoreName: { name: 'storeName', type: 'string' },
    MapKey: { name: 'mapKey', type: 'string' },
    Area: { name: 'salesArea', type: 'number' },
    Sales: { name: 'currentSales', type: 'number' },
    FutureSales: { name: 'futureSales', type: 'number' },
    SqFt: { name: 'salesPSF', type: 'number' },
    PWTA: { name: 'PWTA', type: 'number' },
    Power: { name: 'effectivePower', type: 'number' },
    Change: { name: 'taChange', type: 'number' },
    'Change%': { name: 'taChangePerc', type: 'number' },
    Location: { name: 'location', type: 'string' }
  };

  constructor(
    public auth: AuthService,
    public storeService: StoreService,
    public snackBar: MatSnackBar
  ) {
    this.parser = new DOMParser();
    this.output$ = new Subject<HTMLasJSON>();
  }

  convertToNumber(s: String) {
    return s.replace(/[^0-9.-]/g, '') !== ''
      ? Number(s.replace(/[^0-9.-]/g, ''))
      : null;
  }

  formatString(s: String) {
    return s
      ? s
          .replace(/\n/g, ' ')
          .replace(/ +(?= )/g, '')
          .replace(/&amp;/g, '&')
      : null;
  }

  convertHTMLtoJSON(HTML_STRING, inputData) {
    this.inputData = inputData;
    this.dom = this.parser.parseFromString(HTML_STRING, 'text/html');
    this.outputJSON = new HTMLasJSON();
    this.tables = this.dom.getElementsByTagName('table'); // list of all table elements
    this.currentTableIndex = 0;
    this.currentTableType = null;
    this.generateStoreList();
  }

  checkSiteNumber(HTML_STRING, siteNumber) {
    try {
      const d = this.parser.parseFromString(HTML_STRING, 'text/html');
      const tables = d.getElementsByTagName('table');
      const storeListRows = tables[0].children[2].children;
      let isValid = false;
      for (let i = 0; i < storeListRows.length; i++) {
        const mapKey =
          storeListRows[i].children[1].firstElementChild.firstElementChild; // array containing each cell of current row
        if (mapKey.innerHTML.trim() === siteNumber) {
          isValid = true;
        }
      }
      return isValid;
    } catch (err) {
      return false;
    }
  }

  determineTableType(table) {
    const firstHeaderCell = table.children[1].children[0].children[0];

    // console.log(this.currentTableIndex, 'First Header Cell:', firstHeaderCell.innerText.trim());
    if (!firstHeaderCell.innerText.trim()) {
      const titleElem =
        table.previousElementSibling.previousElementSibling
          .previousElementSibling;

      // console.log(titleElem.innerText)

      return titleElem.tagName === 'P'
        ? titleElem.innerText && titleElem.innerText !== ' '
          ? titleElem.innerText.replace(/\s+/g, ' ')
          : null
        : null;
    } else {
      return firstHeaderCell.innerText.replace(/\s+/g, ' ');
    }
  }

  generateStoreList() {
    ////////////////////////////
    //////// STORE LIST ////////
    const t = this.determineTableType(this.tables[this.currentTableIndex]);
    this.currentTableType = t ? t : this.currentTableType;

    if (this.currentTableType === 'Store List') {
      // console.log('build stores');
      const storeListHeader = this.tables[this.currentTableIndex].children[1]
        .children[1].children;

      const storeListFields = {};

      for (let i = 0; i < storeListHeader.length; i++) {
        storeListFields[i] = this.storeFieldsMap[
          storeListHeader[i].innerText.replace(/\s+/g, '')
        ];
      }

      const storeListRows = this.tables[this.currentTableIndex].children[2]
        .children;
      for (let i = 0; i < storeListRows.length; i++) {
        const storeListItem = this.outputJSON.storeList[i]
          ? this.outputJSON.storeList[i]
          : new StoreListItem();
        const cells = storeListRows[i].children; // array containing each cell of current row
        if (
          cells[1].firstElementChild.firstElementChild.innerHTML !== '&nbsp;' &&
          cells.length > 1
        ) {
          for (let j = 0; j < cells.length; j++) {
            storeListItem[storeListFields[j].name] =
              storeListFields[j].type === 'string'
                ? this.formatString(
                    cells[j].firstElementChild.firstElementChild.innerHTML
                  )
                : this.convertToNumber(
                    cells[j].firstElementChild.firstElementChild.innerHTML
                  );
          }
          if (!this.outputJSON.storeList[i]) {
            this.outputJSON.storeList.push(storeListItem);
          }
        }
      }
      this.currentTableIndex++;
      this.generateStoreList();
    } else {
      this.currentTableType = null;
      const target = this.outputJSON.storeList.filter(
        s => s.mapKey === this.inputData.siteNumber
      )[0];
      this.outputJSON.storeList = this.outputJSON.storeList.map(
        storeListItem => {
          storeListItem.parentCompanyId = null;
          storeListItem.category =
            storeListItem.mapKey === this.inputData.siteNumber ||
            storeListItem.storeName === target.storeName
              ? 'Company Store'
              : storeListItem.uniqueId
                ? 'Existing Competition'
                : 'Do Not Include';
          storeListItem.actualSalesPSF =
            Number(storeListItem.actualSales) / Number(storeListItem.salesArea);
          storeListItem.totalSize = Math.round(
            Number(storeListItem.salesArea) / 0.72
          );

          return storeListItem;
        }
      );
      this.updateStoreTotalAreas();
      this.generateProjectedBefore();
    }
  }

  updateStoreTotalAreas() {
    const storeIds = this.outputJSON.storeList
      .filter(s => s.uniqueId)
      .map(s => s.uniqueId);
    this.storeService.getAllByIds(storeIds).subscribe(
      data => {
        data.forEach((store: SimplifiedStore) => {
          const idx = this.outputJSON.storeList.findIndex(
            s => s.uniqueId === store.id
          );
          if (idx !== -1) {
            this.outputJSON.storeList[idx].totalSize = store.areaTotal;
          }
        });
      },
      () => {
        setTimeout(() => {
          this.snackBar.open(
            'Failed to retrieve total area from database... used estimation calculations instead',
            'OK',
            {
              duration: 99999
            }
          );
        }, 1);
      }
    );
  }

  generateProjectedBefore() {
    //////////////////////////////////////////
    //////// PROJECTED VOLUMES BEFORE ////////
    const t = this.determineTableType(this.tables[this.currentTableIndex]);
    // console.log(t)
    this.currentTableType = t
      ? t !== this.currentTableType
        ? t
        : this.currentTableType + '_2'
      : this.currentTableType;

    // console.log(this.currentTableType);

    if (this.currentTableType === 'Projected Volumes') {
      // console.log('build volumes');
      const header = this.tables[this.currentTableIndex].children[1].children[1]
        .children;

      const volumeListFields = {};
      let matchedSales = false;

      for (let i = 0; i < header.length; i++) {
        let text = header[i].innerText
          .replace(/\s+/g, '')
          .replace('/', '')
          .replace(/\./g, '');
        // console.log(text);
        if (text === 'Sales') {
          if (matchedSales) {
            text = 'FutureSales';
            const firstHeader = this.tables[this.currentTableIndex].children[1]
              .children[0].children;

            this.outputJSON.firstYearEndingMonthYear = this.formatString(
              firstHeader[i].innerText
            ).trim();
          } else {
            matchedSales = true;
          }
        }
        volumeListFields[i] = this.volumeFieldsMap[text];
      }
      console.log(volumeListFields);

      const volumeListRows = this.tables[this.currentTableIndex].children[2]
        .children;
      for (let i = 0; i < volumeListRows.length; i++) {
        const volumeListItem = this.outputJSON.projectedVolumesBefore[i]
          ? this.outputJSON.projectedVolumesBefore[i]
          : new VolumeItem();
        const cells = volumeListRows[i].children; // array containing each cell of current row
        if (
          cells[1].firstElementChild.firstElementChild.innerHTML !== '&nbsp;' &&
          cells.length > 1
        ) {
          for (let j = 0; j < cells.length; j++) {
            volumeListItem[volumeListFields[j].name] =
              volumeListFields[j].type === 'string'
                ? this.formatString(
                    cells[j].firstElementChild.firstElementChild.innerHTML
                  )
                : this.convertToNumber(
                    cells[j].firstElementChild.firstElementChild.innerHTML
                  );
          }
          if (!this.outputJSON.projectedVolumesBefore[i]) {
            this.outputJSON.projectedVolumesBefore.push(volumeListItem);
          } else {
            this.outputJSON.projectedVolumesBefore[i] = volumeListItem;
          }
        }
      }

      this.currentTableIndex++;
      // console.log(this.outputJSON.projectedVolumesBefore);
      this.generateProjectedBefore();
    } else {
      this.generateProjectedAfter();
    }
  }

  generateProjectedAfter() {
    /////////////////////////////////////////
    //////// PROJECTED VOLUMES AFTER ////////
    const t = this.determineTableType(this.tables[this.currentTableIndex]);
    this.currentTableType = t ? t : this.currentTableType;
    // console.log(this.currentTableType);

    if (this.currentTableType === 'Projected Volumes') {
      // console.log('AFTER');
      const header = this.tables[this.currentTableIndex].children[1].children[1]
        .children;

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
      // console.log(volumeListFields);

      const volumeListRows = this.tables[this.currentTableIndex].children[2]
        .children;
      for (let i = 0; i < volumeListRows.length; i++) {
        const volumeListItem = this.outputJSON.projectedVolumesAfter[i]
          ? this.outputJSON.projectedVolumesAfter[i]
          : new VolumeItem();
        const cells = volumeListRows[i].children; // array containing each cell of current row
        if (
          cells[1].firstElementChild.firstElementChild.innerHTML !== '&nbsp;' &&
          cells.length > 1
        ) {
          for (let j = 0; j < cells.length; j++) {
            volumeListItem[volumeListFields[j].name] =
              volumeListFields[j].type === 'string'
                ? this.formatString(
                    cells[j].firstElementChild.firstElementChild.innerHTML
                  )
                : this.convertToNumber(
                    cells[j].firstElementChild.firstElementChild.innerHTML
                  );
          }
          if (!this.outputJSON.projectedVolumesAfter[i]) {
            this.outputJSON.projectedVolumesAfter.push(volumeListItem);
          } else {
            this.outputJSON.projectedVolumesAfter[i] = volumeListItem;
          }
        }
      }
      this.currentTableIndex++;
      this.generateProjectedAfter();
    } else {
      this.generateSalesGrowthProjection();
    }
  }

  generateSalesGrowthProjection() {
    /////////////////////////////////////////
    //////// Sales Growth Projection ////////

    const salesGrowthProjection1Rows = this.tables[this.currentTableIndex]
      .children[1].children;
    const sgpMapping = {
      first: [],
      second: [],
      third: [],
      fourth: [],
      fifth: []
    };
    for (let i = 0; i < salesGrowthProjection1Rows.length; i++) {
      const cells = salesGrowthProjection1Rows[i].children; // array containing each cell of current row

      const cell0Includes = (searchString: string) => cells[0].firstElementChild.firstElementChild.innerHTML.includes(searchString);
      const salesAndPsf = {
        sales: this.convertToNumber(
          cells[1].firstElementChild.firstElementChild.innerHTML
        ),
        salesPSF: this.convertToNumber(
          cells[3].firstElementChild.firstElementChild.innerHTML
        )
      };

      if (cells[1].firstElementChild.firstElementChild.innerHTML !== '&nbsp;') {
        if (cell0Includes('First')) {
          sgpMapping.first.push(salesAndPsf);
        }
        if (cell0Includes('Second')) {
          sgpMapping.second.push(salesAndPsf);
        }
        if (cell0Includes('Third')) {
          sgpMapping.third.push(salesAndPsf);
        }
        if (cell0Includes('Fourth')) {
          sgpMapping.fourth.push(salesAndPsf);
        }
        if (cell0Includes('Fifth')) {
          sgpMapping.fifth.push(salesAndPsf);
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
    this.currentTableIndex++;
    this.generateMarketShareBySector();
  }

  generateMarketShareBySector() {
    ////////////////////////////////////////
    //////// MARKET SHARE BY SECTOR ////////

    const marketShareBySector1Rows = this.tables[this.currentTableIndex]
      .children[2].children;
    for (let i = 0; i < marketShareBySector1Rows.length; i++) {
      const marketShareBySectorItem = new MarketShareBySectorItem();
      const cells = marketShareBySector1Rows[i].children; // array containing each cell of current row

      const getCellText = (cellNum: number) => cells[cellNum].firstElementChild.firstElementChild.innerHTML;

      if (getCellText(0) !== '&nbsp;' && cells.length > 2
      ) {
        marketShareBySectorItem.sector = this.formatString(getCellText(0));
        marketShareBySectorItem.projectedSales = this.convertToNumber(getCellText(1));
        marketShareBySectorItem.projectedMS = this.convertToNumber(getCellText(2));
        marketShareBySectorItem.effectivePower = this.convertToNumber(getCellText(3));
        marketShareBySectorItem.futurePop1 = this.convertToNumber(getCellText(4));
        marketShareBySectorItem.projectedPotential = this.convertToNumber(getCellText(5));
        marketShareBySectorItem.projectedPCW = this.convertToNumber(getCellText(6));
        marketShareBySectorItem.leakage = this.convertToNumber(getCellText(7));
        marketShareBySectorItem.distribution = this.convertToNumber(getCellText(8));
        marketShareBySectorItem.futurePop2 = this.convertToNumber(getCellText(9));
        marketShareBySectorItem.futurePop3 = this.convertToNumber(getCellText(10));
        this.outputJSON.marketShareBySector.push(marketShareBySectorItem);
      }
    }
    this.currentTableIndex++;
    this.generateSectorList();
  }

  generateSectorList() {
    /////////////////////////////
    //////// SECTOR LIST ////////

    const sectorList1Rows = this.tables[this.currentTableIndex].children[2]
      .children;
    for (let i = 0; i < sectorList1Rows.length; i++) {
      const sectorListItem = new SectorListItem();
      const cells = sectorList1Rows[i].children; // array containing each cell of current row

      const getCellText = (cellNum: number) => cells[cellNum].firstElementChild.firstElementChild.innerHTML;

      if (getCellText(0) !== '&nbsp;' && cells.length > 1) {
        sectorListItem.sector = this.formatString(getCellText(0));
        sectorListItem.name = this.formatString(getCellText(1));
        sectorListItem.latitude = this.convertToNumber(getCellText(2));
        sectorListItem.longitude = this.convertToNumber(getCellText(3));
        sectorListItem.pop = this.convertToNumber(getCellText(4));
        sectorListItem.PCW = this.convertToNumber(getCellText(5));
        sectorListItem.leakage = this.convertToNumber(getCellText(6));

        this.outputJSON.sectorList.push(sectorListItem);
      }
    }

    this.sendResult();
  }

  sendResult() {
    this.output$.next(this.outputJSON);
  }
}
