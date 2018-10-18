import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { ReportData } from '../../models/report-data';
import { WorkBook, WorkSheet } from 'xlsx';
import { StoreListItem } from '../../models/store-list-item';
import { Observable } from 'rxjs';
import { SectorListItem } from '../../models/sector-list-item';
import { MarketShareBySectorItem } from '../../models/market-share-by-sector-item';
import { SalesGrowthProjectionItem } from '../../models/sales-growth-projection-item';
import { VolumeItem } from '../../models/volume-item';

@Injectable({
  providedIn: 'root'
})
export class XlsToModelParserService {

  parseXls(fileString): Observable<ReportData> {
    return Observable.create(observer => {
      const reportData = new ReportData();

      const wb: XLSX.WorkBook = XLSX.read(fileString, {type: 'binary'});

      reportData.storeList = this.getStoreList(wb.Sheets[wb.SheetNames[0]]);
      reportData.projectedVolumesBefore = this.getProjectedVolumes(wb.Sheets[wb.SheetNames[1]]);
      reportData.projectedVolumesAfter = this.getProjectedVolumes(wb.Sheets[wb.SheetNames[2]]);
      reportData.salesGrowthProjection = this.getSalesGrowthProjection(wb.Sheets[wb.SheetNames[3]]);
      reportData.marketShareBySector = this.getMarketShareBySector(wb.Sheets[wb.SheetNames[4]]);
      reportData.sectorList = this.getSectorList(wb.Sheets[wb.SheetNames[5]]);

      reportData.firstYearEndingMonthYear = this.getFirstYearEndingMonthYear(wb);
      reportData.selectedMapKey = this.getSelectedMapKey(wb);

      observer.next(reportData);
      observer.complete();
    })
  }

  private getStoreList(ws: WorkSheet): StoreListItem[] {
    const storeListItems: StoreListItem[] = [];

    let row = 4;
    do {
      const actualSales = this.getNumberFromCell(ws, 'G' + row);
      const salesArea = this.getNumberFromCell(ws, 'F' + row);
      const actualSalesPSF = actualSales / salesArea;
      storeListItems.push({
        storeName: ws['A' + row].v,
        mapKey: this.getNumberFromCell(ws, 'B' + row),
        uniqueId: this.getNumberFromCell(ws, 'C' + row),
        latitude: this.getNumberFromCell(ws, 'D' + row),
        longitude: this.getNumberFromCell(ws, 'E' + row),
        salesArea: salesArea,
        actualSales: actualSales,
        actualSalesPSF: actualSalesPSF,
        marketShare: this.getNumberFromCell(ws, 'H' + row),
        effectivePower: this.getNumberFromCell(ws, 'I' + row),
        curve: this.getNumberFromCell(ws, 'J' + row),
        PWTA: this.getNumberFromCell(ws, 'K' + row),
        location: ws['M' + row].v,
        parentCompanyId: null,
        category: null,
        totalArea: null
      })
    } while (!ws['A' + ++row].v.includes('Totals'));

    return storeListItems;
  }

  private getProjectedVolumes(ws: WorkSheet): VolumeItem[] {
    const volumeItems: VolumeItem[] = [];

    let row = 4;
    do {
      volumeItems.push({
        storeName: ws['A' + row].v,
        mapKey: this.getNumberFromCell(ws, 'B' + row),
        salesArea: this.getNumberFromCell(ws, 'C' + row),
        currentSales: this.getNumberFromCell(ws, 'D' + row),
        futureSales: this.getNumberFromCell(ws, 'E' + row),
        salesPSF: this.getNumberFromCell(ws, 'F' + row),
        PWTA: this.getNumberFromCell(ws, 'G' + row),
        effectivePower: this.getNumberFromCell(ws, 'H' + row),
        taChange: this.getNumberFromCell(ws, 'I' + row),
        taChangePerc: this.getNumberFromCell(ws, 'J' + row),
        location: ws['K' + row].v
      })
    } while (!ws['A' + ++row].v.includes('Totals'));

    return volumeItems;
  }

  private getSalesGrowthProjection(ws: WorkSheet): SalesGrowthProjectionItem[] {
    return [
      new SalesGrowthProjectionItem(
        ws['B10'].v, ws['D10'].v,
        ws['B11'].v, ws['D11'].v,
        ws['B12'].v, ws['D12'].v,
        ws['B13'].v, ws['D13'].v,
        ws['B14'].v, ws['D14'].v
      ),
      new SalesGrowthProjectionItem(
        ws['B16'].v, ws['D16'].v,
        ws['B17'].v, ws['D17'].v,
        ws['B18'].v, ws['D18'].v,
        ws['B19'].v, ws['D19'].v,
        ws['B20'].v, ws['D20'].v
      ),
    ];
  }

  private getMarketShareBySector(ws: WorkSheet): MarketShareBySectorItem[] {
    const items: MarketShareBySectorItem[] = [];

    let row = 6;
    do {
      items.push({
        sector: this.getNumberFromCell(ws, 'A' + row),
        projectedSales: this.getNumberFromCell(ws, 'B' + row),
        projectedMS: this.getNumberFromCell(ws, 'C' + row),
        effectivePower: this.getNumberFromCell(ws, 'D' + row),
        futurePop1: this.getNumberFromCell(ws, 'E' + row),
        projectedPotential: this.getNumberFromCell(ws, 'F' + row),
        projectedPCW: this.getNumberFromCell(ws, 'G' + row),
        leakage: this.getNumberFromCell(ws, 'H' + row),
        distribution: this.getNumberFromCell(ws, 'I' + row),
        futurePop2: this.getNumberFromCell(ws, 'J' + row),
        futurePop3: this.getNumberFromCell(ws, 'K' + row)
      })
    } while (ws['A' + ++row].t === 'n');

    return items;
  }

  private getSectorList(ws: WorkSheet): SectorListItem[] {
    const items: SectorListItem[] = [];

    let row = 4;
    do {
      items.push({
        sector: this.getNumberFromCell(ws, 'A' + row),
        name: ws['B' + row].v,
        latitude: this.getNumberFromCell(ws, 'C' + row),
        longitude: this.getNumberFromCell(ws, 'D' + row),
        pop: this.getNumberFromCell(ws, 'E' + row),
        PCW: this.getNumberFromCell(ws, 'F' + row),
        leakage: this.getNumberFromCell(ws, 'G' + row)
      })
    } while (ws['A' + ++row].t === 'n');

    return items;
  }

  private getFirstYearEndingMonthYear(wb: WorkBook): string {
    const sheetName = wb.SheetNames[1];
    const sheet = wb.Sheets[sheetName];
    return sheet['E2'].v;
  }

  private getSelectedMapKey(wb: WorkBook): number {
    const sheetName = wb.SheetNames[3];
    const sheet = wb.Sheets[sheetName];
    const text = sheet['A5'].v;
    const regex = /^.*Store\s([\d.]+):.*/;
    const match = regex.exec(text);
    return parseFloat(match[1]);
  }

  private getNumberFromCell(ws: WorkSheet, ref: string): number {
    const cell = ws[ref];
    if (cell.t === 'n') {
      return cell.v;
    }
    const value = parseFloat(cell.v);
    return isNaN(value) ? null : value;
  }

}
