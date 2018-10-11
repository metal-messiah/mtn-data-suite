import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { ReportData } from '../../models/report-data';

@Injectable({
  providedIn: 'root'
})
export class XlsToModelParserService {

  constructor() {
  }

  parseXls(fileString) {
    const reportData = new ReportData();

    const wb: XLSX.WorkBook = XLSX.read(fileString, {type: 'binary'});

    /* grab first sheet */
    const storeListWs: XLSX.WorkSheet = wb.Sheets[wb.SheetNames[0]];
    const valueA1 = storeListWs['A1'].v;
    const valueB1 = storeListWs['B1'].v;
    const valueC1 = storeListWs['C1'].v;
    const valueA2 = storeListWs['A2'].v;
    const valueB2 = storeListWs['B2'].v;
    const valueC2 = storeListWs['C2'].v;
    // const projectedVolumesBeforeWs: XLSX.WorkSheet = wb.Sheets[wb.SheetNames[1]];
    // const projectedVolumesAfterWs: XLSX.WorkSheet = wb.Sheets[wb.SheetNames[2]];
    // const salesGrowthProjectionWs: XLSX.WorkSheet = wb.Sheets[wb.SheetNames[3]];
    // const marketShareBySectorWs: XLSX.WorkSheet = wb.Sheets[wb.SheetNames[4]];
    // const sectorListWs: XLSX.WorkSheet = wb.Sheets[wb.SheetNames[5]];

    /* save data */
    const data = XLSX.utils.sheet_to_json(storeListWs, {header: 1});
    console.log(data);
  }
}
