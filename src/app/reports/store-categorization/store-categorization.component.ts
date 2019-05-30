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
              public _location: Location,
              private router: Router) {
  }

  ngOnInit() {
    if (!this.rbs.getReportTableData()) {
      setTimeout(() => {
        this.snackBar.open('No data has been loaded. Starting from the beginning', null, {duration: 5000});
        this.router.navigate(['reports']);
      }, 10)
    }
    document.getElementById('reports-content-wrapper').scrollTop = 0;
  }

  changeCategory(event, store) {
    store.category = event.target.value;
  }

  changeCombinedCategory(event, combo) {
    console.log(combo, ' change to ', event.target.value);
    this.rbs.getReportTableData().storeList.forEach(s => {
      if (s.bannerName === combo.bannerName && s.scenario === 'Existing') {
        s.category = event.target.value;
      }
    });
  }

  getExistingStoresCount(bannerName) {
    return this.rbs.getReportTableData().storeList.filter(s => s.bannerName === bannerName && s.uniqueId).length;
  }

  getExistingStoresCombined() {
    return this.rbs.getReportTableData().storeList
    // If store has unique ID, then it exists in DB. If a store has a decimal or the store is the site then it should be treated separately.
      .filter(s => s.scenario === 'Existing')
      .map(s => {
        return {bannerName: s.bannerName, category: s.category};
      })
      .filter((elem, idx, arr) => arr.findIndex(e => e.bannerName === elem.bannerName) === idx)
      .sort((a, b) => a.bannerName.localeCompare(b.bannerName));
  }

  getProposedStores() {
    return this.rbs.getReportTableData().storeList.filter(s => s.scenario !== 'Existing');
  }

}
