import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';

import htmlToImage from 'html-to-image';
import jsZip from 'jszip';
import { saveAs } from 'file-saver';
import { ReportBuilderService } from '../services/report-builder.service';
import { JsonToTablesUtil } from './json-to-tables.util';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'mds-report-tables',
  templateUrl: './report-tables.component.html',
  styleUrls: ['./report-tables.component.css']
})
export class ReportTablesComponent implements OnInit {

  mapImage: string;
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
      this.getMapImage();
      document.getElementById('reports-content-wrapper').scrollTop = 0;
    }
  }

  getFirstYearAsNumber() {
    return (
      2000 +
      Number(this.tablesUtil.tableData.firstYearEndingMonthYear.trim().split(' ')[1])
    );
  }

  export() {
    this.rbs.compilingImages = true;

    const exportPromises: Promise<any>[] = [];

    // convert tables to images
    this.tableDomIds.forEach(id => {
      const node = document.getElementById(id);
      exportPromises.push(htmlToImage.toBlob(node));
    });

    Promise.all(exportPromises)
      .then(data => {
        this.rbs.compilingImages = false;
        console.log(data);
        this.router.navigate(['reports/download']);

        const zip = new jsZip();
        // table images
        data.forEach((fileData, i) => {
          zip.file(`${this.tableDomIds[i]}.png`, fileData);
        });

        let txt = '';

        Object.keys(this.tablesUtil.reportMetaData).forEach(key => {
          txt += `${key}:\r\n${this.tablesUtil.reportMetaData[key]}\r\n\r\n`
        });

        txt += `Store Name:\r\n${this.tablesUtil.targetStore.storeName}\r\n\r\n`;
        txt += `Map Key:\r\n${this.tablesUtil.targetStore.mapKey}\r\n\r\n`;

        Object.keys(this.tablesUtil.siteEvaluationNarrative).forEach(key => {
          txt += `${key}:\r\n${this.tablesUtil.siteEvaluationNarrative[key]}\r\n\r\n`
        });

        zip.file(`descriptions.txt`, new Blob([txt]));

        const modelName = this.tablesUtil.reportMetaData.modelName;
        zip.generateAsync({type: 'blob'}).then(blob => {
          saveAs(blob, `${modelName ? modelName : 'MTNRA_Reports_Export'}.zip`);
        });
      })
      .catch(error => {
        this.rbs.compilingImages = false;
        this.snackBar.open(error, null, {duration: 2000});
      });
  }

  getMapImage(basemap?: string, zoom?: number) {
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

    this.mapImage = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${
      this.googleMapsZoom
      }&size=470x350&maptype=${this.googleMapsBasemap}&${targetPin}&key=${
      this.googleMapsKey
      }`;
  }

}
