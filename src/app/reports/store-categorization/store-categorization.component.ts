import { Component, ElementRef, OnInit } from '@angular/core';
import { ReportBuilderService } from '../services/report-builder.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'mds-store-categorization',
  templateUrl: './store-categorization.component.html',
  styleUrls: ['./store-categorization.component.css', '../shared-report-style.css']
})
export class StoreCategorizationComponent implements OnInit {

  existingStoresCombined;
  proposedStores;

  categories: string[] = [
    'Company Store',
    'Existing Competition',
    'Proposed Competition',
    'Do Not Include'
  ];

  constructor(private _rbs: ReportBuilderService,
              private snackBar: MatSnackBar,
              private router: Router,
              private host: ElementRef) {
  }

  get saving() {
    return this._rbs.saving;
  }

  ngOnInit() {
    if (this._rbs.getReportTableData()) {
      this.initViewData();
    } else {
      this._rbs.loadLatest().subscribe(() => {
        this.initViewData();
        this.snackBar.open('Loaded latest model', null, {duration: 2000});
      }, err => {
        this.snackBar.open(err, null, {duration: 2000});
        this.router.navigate(['reports']);
      });
    }
  }

  getStoreRowClass(store) {
    return this._rbs.getStoreRowClass(store.category);
  }

  changeCategory(event, store) {
    store.category = event.target.value;

    this.proposedStores = this.getProposedStores();

    if (this._rbs.doSave) {
      this._rbs.saveModel();
    }
  }

  changeCombinedCategory(event, banner) {
    // Update the category for all Existing stores of the given banner
    this._rbs.getReportTableData().storeList
      .filter(store => store.scenario === 'Existing' && store.bannerName === banner.bannerName)
      .forEach(store => {
        store.category = event.target.value;
      });

    this.existingStoresCombined = this.getExistingStoresCombined();

    // Save the data
    if (this._rbs.doSave) {
      this._rbs.saveModel();
    }
  }

  private initViewData() {
    this.existingStoresCombined = this.getExistingStoresCombined();
    this.proposedStores = this.getProposedStores();
    this.host.nativeElement.scrollTop = 0;
  }

  private getExistingStoresCombined() {
    const existingStores = {};
    this._rbs.getReportTableData().storeList
      .filter(s => s.scenario === 'Existing')
      .forEach(store => {
        if (!existingStores[store.bannerName]) {
          existingStores[store.bannerName] = {bannerName: store.bannerName, category: store.category, count: 1};
        } else {
          existingStores[store.bannerName].count = existingStores[store.bannerName].count + 1;
        }
      });
    return Object.keys(existingStores).map(key => existingStores[key])
      .sort((a, b) => a.bannerName.localeCompare(b.bannerName));
  }

  private getProposedStores() {
    return this._rbs.getReportTableData().storeList.filter(s => s.scenario !== 'Existing');
  }

}
