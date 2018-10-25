import { Component, OnInit } from '@angular/core';
import { ReportBuilderService } from '../services/report-builder.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'mds-store-categorization',
  templateUrl: './store-categorization.component.html',
  styleUrls: ['./store-categorization.component.css']
})
export class StoreCategorizationComponent implements OnInit {

  categories: string[] = [
    'Company Store',
    'Existing Competition',
    'Proposed Competition',
    'Do Not Include'
  ];

  constructor(public rbs: ReportBuilderService,
              private snackBar: MatSnackBar,
              private _location: Location,
              private router: Router) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    if (!this.rbs.reportTableData) {
      this.snackBar.open('No data has been loaded. Starting from the beginning', null, {duration: 5000});
      this.router.navigate(['reports']);
    }
  }

  changeCategory(event, mapKey) {
    const idx: number = this.rbs.reportTableData.storeList.findIndex(
      s => s.mapKey === mapKey
    );
    if (idx !== -1) {
      this.rbs.reportTableData.storeList[idx].category = event.target.value;
      console.log(this.rbs.reportTableData.storeList[idx]);
    }
  }

  changeCombinedCategory(event, combo) {
    console.log(combo, ' change to ', event.target.value);
    this.rbs.reportTableData.storeList.forEach((s, i) => {
      if (s.storeName === combo.storeName && s.uniqueId) {
        this.rbs.reportTableData.storeList[i].category = event.target.value;
      }
    });
  }

  getExistingStoresCount(storeName) {
    return this.rbs.reportTableData.storeList.filter(
      s => s.storeName === storeName && s.uniqueId
    ).length;
  }

  getExistingStoresCombined() {
    return this.rbs.reportTableData.storeList
      .filter(s => s.uniqueId !== null)
      .map(s => {
        return {storeName: s.storeName, category: s.category};
      })
      .filter((elem, idx, arr) => {
        return arr.findIndex(e => e.storeName === elem.storeName) === idx;
      })
      .sort((a, b) => a.storeName.localeCompare(b.storeName));
  }

  getProposedStores() {
    return this.rbs.reportTableData.storeList.filter(s => s.uniqueId === null);
  }

  next() {
    this.router.navigate(['reports/data-verification']);
  }

}
