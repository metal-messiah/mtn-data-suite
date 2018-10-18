import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';

import htmlToImage from 'html-to-image';
import jsZip from 'jszip';
import { saveAs } from 'file-saver';
import { ReportBuilderService } from '../services/report-builder.service';

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

  tableDomIds: string[] = [
    'projectionsTable',
    'currentStoresWeeklySummaryTable',
    'projectedStoresWeeklySummaryTable',
    'sourceOfVolumeTable',
    'mapImage',
    'descriptionsRatings'
  ];

  exportPromises: Promise<any>[] = [];

  constructor(public snackBar: MatSnackBar,
              public rbs: ReportBuilderService,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    this.getMapImage();
  }

  getFirstYearAsNumber() {
    return (
      2000 +
      Number(this.rbs.jsonToTablesUtil.reportTableData.firstYearEndingMonthYear.trim().split(' ')[1])
    );
  }

  export() {
    this.rbs.compilingImages = true;
    // convert tables to images
    this.tableDomIds.forEach(id => {
      const node = document.getElementById(id);
      this.exportPromises.push(htmlToImage.toBlob(node));
    });

    Promise.all(this.exportPromises)
      .then(data => {
        this.rbs.compilingImages = false;
        console.log(data);
        const zip = new jsZip();
        // table images
        data.forEach((fileData, i) => {
          zip.file(`${this.tableDomIds[i]}.png`, fileData);
        });

        const sisterStoreAffects = this.rbs.jsonToTablesUtil
          .getStoresForExport('Company Store')
          .sort((a, b) => {
            if (a.storeName === b.storeName) {
              return Number(a.mapKey) - Number(b.mapKey);
            } else {
              return a.storeName < b.storeName ? -1 : 1;
            }
          })
          .map(store => `${store.storeName} ${store.mapKey}`)
          .join('\r\n');

        const txt = `Street Conditions\r\n${
          this.rbs.jsonToTablesUtil.siteEvaluationData.streetConditions
          }\r\n\r\nComments\r\n${
          this.rbs.jsonToTablesUtil.siteEvaluationData.comments
          }\r\n\r\nTraffic Controls\r\n${
          this.rbs.jsonToTablesUtil.siteEvaluationData.streetConditions
          }\r\n\r\nCo-tenants\r\n${
          this.rbs.jsonToTablesUtil.siteEvaluationData.cotenants
          }\r\n\r\nSister Store Affects\r\n${sisterStoreAffects}`;

        zip.file(`descriptions.txt`, new Blob([txt]));

        const modelName = this.rbs.jsonToTablesUtil.reportMetaData.modelName;
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
    const target = this.rbs.jsonToTablesUtil.getTargetStore();
    const stores = this.rbs.jsonToTablesUtil.getProjectedStoresWeeklySummary();

    const storePins = stores
      .map(s => {
        if (s.latitude && s.longitude) {
          const isTarget = s.mapKey === target.mapKey;
          const color = isTarget
            ? 'red'
            : s.category === 'Company Store'
              ? 'blue'
              : 'yellow';
          return `&markers=color:${color}%7Clabel:${
            isTarget ? s.storeName[0] : ''
            }%7C${s.latitude},${s.longitude}`;
        }
      })
      .join('');

    const {latitude, longitude} = target;

    this.mapImage = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${
      this.googleMapsZoom
      }&size=470x350&maptype=${this.googleMapsBasemap}&${storePins}&key=${
      this.googleMapsKey
      }`;
  }

}
