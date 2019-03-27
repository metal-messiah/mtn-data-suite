import { Component, OnInit } from '@angular/core';
import { ReportBuilderService } from '../services/report-builder.service';
import { AbstractControl, FormArray } from '@angular/forms';
import { Location } from '@angular/common';
import { StoreListItem } from '../../models/store-list-item';
import { Router } from '@angular/router';
import { MatSnackBar, Sort } from '@angular/material';

@Component({
  selector: 'mds-store-data-verification',
  templateUrl: './store-data-verification.component.html',
  styleUrls: ['./store-data-verification.component.css']
})
export class StoreDataVerificationComponent implements OnInit {

  categories: string[] = [
    'Company Store',
    'Existing Competition',
    'Proposed Competition',
    'Do Not Include'
  ];

  constructor(public rbs: ReportBuilderService,
              public _location: Location,
              public router: Router,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    if (!this.rbs.dataVerifcationForm) {
      this.snackBar.open('No data has been loaded. Starting from the beginning', null, {duration: 5000});
      this.router.navigate(['reports']);
    } else {
      document.getElementById('reports-content-wrapper').scrollTop = 0;
    }
  }

  private updateSiteListItems() {
    (this.rbs.dataVerifcationForm.get('stores') as FormArray).controls.forEach(siControl => {
      const mapKey = siControl.get('mapKey').value;
      const storeListItem: StoreListItem = this.rbs.getReportTableData().storeList.find(s => s.mapKey === mapKey);
      storeListItem.category = siControl.get('category').value;
      storeListItem.totalArea = siControl.get('totalArea').value;
      storeListItem.useTradeAreaChange = siControl.get('useTradeAreaChange').value;
      storeListItem.forceInclusion = siControl.get('forceInclusion').value;
    });
  }

  next() {
    this.updateSiteListItems();
    this.router.navigate(['reports/site-evaluation'])
  }

  harrisTeeter() {
    this.updateSiteListItems();
    this.router.navigate(['reports/harris-teeter'])
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  sortData(sort: Sort): AbstractControl[] {
    const controls = (this.rbs.dataVerifcationForm.get('stores') as FormArray).controls;
    if (!sort.active || sort.direction === '') {
      return controls;
    } else {
      return controls.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'mapKey': return this.compare(a.get('mapKey').value, b.get('mapKey').value, isAsc);
          case 'uniqueId': return this.compare(a.get('uniqueId').value, b.get('uniqueId').value, isAsc);
          case 'storeName': return this.compare(a.get('storeName').value, b.get('storeName').value, isAsc);
          case 'scenario': return this.compare(a.get('scenario').value, b.get('scenario').value, isAsc);
          case 'category': return this.compare(a.get('category').value, b.get('category').value, isAsc);
          case 'location': return this.compare(a.get('location').value, b.get('location').value, isAsc);
          case 'salesArea': return this.compare(a.get('salesArea').value, b.get('salesArea').value, isAsc);
          case 'totalArea': return this.compare(a.get('totalArea').value, b.get('totalArea').value, isAsc);
          case 'totalChange': return this.compare(a.get('totalChange').value, b.get('totalChange').value, isAsc);
          case 'totalChangePerc': return this.compare(a.get('totalChangePerc').value, b.get('totalChangePerc').value, isAsc);
          case 'tradeAreaChange': return this.compare(a.get('tradeAreaChange').value, b.get('tradeAreaChange').value, isAsc);
          case 'tradeAreaChangePerc': return this.compare(a.get('tradeAreaChangePerc').value, b.get('tradeAreaChangePerc').value, isAsc);
          default: return 0;
        }
      })
    }
  }

  getRowColor(store) {
    switch (store.category) {
      case 'Company Store': return 'blue';
      case 'Existing Competition': return 'yellow';
      case 'Proposed Competition': return 'pink';
      case 'Do Not Include': return 'grey';
    }
  }

  getStoreHRef(store) {
    return `${location.origin}/casing?store-id=${store.get('uniqueId').value}`;
  }

}
