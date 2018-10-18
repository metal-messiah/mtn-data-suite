import { Component, OnInit } from '@angular/core';
import { ReportBuilderService } from '../services/report-builder.service';

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

  constructor(public rbs: ReportBuilderService) { }

  ngOnInit() {
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

}
