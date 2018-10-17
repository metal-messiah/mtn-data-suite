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

  constructor(public reportBuilderService: ReportBuilderService) { }

  ngOnInit() {
  }

  changeCategory(event, mapKey) {
    const idx: number = this.reportBuilderService.reportTableData.storeList.findIndex(
      s => s.mapKey === mapKey
    );
    if (idx !== -1) {
      this.reportBuilderService.reportTableData.storeList[idx].category = event.target.value;
      console.log(this.reportBuilderService.reportTableData.storeList[idx]);
    }
  }

  changeCombinedCategory(event, combo) {
    console.log(combo, ' change to ', event.target.value);
    this.reportBuilderService.reportTableData.storeList.forEach((s, i) => {
      if (s.storeName === combo.storeName && s.uniqueId) {
        this.reportBuilderService.reportTableData.storeList[i].category = event.target.value;
      }
    });
  }

  getExistingStoresCount(storeName) {
    return this.reportBuilderService.reportTableData.storeList.filter(
      s => s.storeName === storeName && s.uniqueId
    ).length;
  }

  getExistingStoresCombined() {
    return this.reportBuilderService.reportTableData.storeList
      .filter(s => s.uniqueId !== null)
      .map(s => {
        return {storeName: s.storeName, category: s.category};
      })
      .filter((elem, idx, arr) => {
        return arr.findIndex(e => e.storeName === elem.storeName) === idx;
      });
  }

  getProposedStores() {
    return this.reportBuilderService.reportTableData.storeList.filter(s => s.uniqueId === null);
  }

}
