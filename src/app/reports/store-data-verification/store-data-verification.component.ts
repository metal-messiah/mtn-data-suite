import { Component, ElementRef, OnInit } from '@angular/core';
import { ReportBuilderService } from '../services/report-builder.service';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { StoreListItem } from '../../models/store-list-item';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { debounce } from 'rxjs/operators';
import { timer } from 'rxjs';

@Component({
  selector: 'mds-store-data-verification',
  templateUrl: './store-data-verification.component.html',
  styleUrls: ['./store-data-verification.component.css', '../shared-report-style.css']
})
export class StoreDataVerificationComponent implements OnInit {

  dataVerificationForm: FormGroup;

  readonly categories: string[] = [
    'Company Store',
    'Existing Competition',
    'Proposed Competition',
    'Do Not Include'
  ];

  constructor(private _rbs: ReportBuilderService,
              private router: Router,
              private snackBar: MatSnackBar,
              private host: ElementRef) {
  }

  get saving() {
    return this._rbs.saving;
  }

  ngOnInit() {
    if (this._rbs.getReportTableData()) {
      this.initForm();
    } else {
      this._rbs.loadLatest().subscribe(() => {
        this.initForm();
        this.snackBar.open('Loaded latest model', null, {duration: 2000});
      }, err => {
        this.snackBar.open(err, null, {duration: 2000});
        this.router.navigate(['reports']);
      });
    }
  }

  sortData(sort: Sort): AbstractControl[] {
    const controls = (this.dataVerificationForm.get('stores') as FormArray).controls;
    if (!sort.active || sort.direction === '') {
      return controls;
    } else {
      return controls.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'mapKey':
            return this.compare(a.get('mapKey').value, b.get('mapKey').value, isAsc);
          case 'uniqueId':
            return this.compare(a.get('uniqueId').value, b.get('uniqueId').value, isAsc);
          case 'storeName':
            return this.compare(a.get('storeName').value, b.get('storeName').value, isAsc);
          case 'scenario':
            return this.compare(a.get('scenario').value, b.get('scenario').value, isAsc);
          case 'category':
            return this.compare(a.get('category').value, b.get('category').value, isAsc);
          case 'location':
            return this.compare(a.get('location').value, b.get('location').value, isAsc);
          case 'salesArea':
            return this.compare(a.get('salesArea').value, b.get('salesArea').value, isAsc);
          case 'totalArea':
            return this.compare(a.get('totalArea').value, b.get('totalArea').value, isAsc);
          case 'totalChange':
            return this.compare(a.get('totalChange').value, b.get('totalChange').value, isAsc);
          case 'totalChangePerc':
            return this.compare(a.get('totalChangePerc').value, b.get('totalChangePerc').value, isAsc);
          case 'tradeAreaChange':
            return this.compare(a.get('tradeAreaChange').value, b.get('tradeAreaChange').value, isAsc);
          case 'tradeAreaChangePerc':
            return this.compare(a.get('tradeAreaChangePerc').value, b.get('tradeAreaChangePerc').value, isAsc);
          default:
            return 0;
        }
      });
    }
  }

  getRowColor(store) {
    return this._rbs.getStoreRowClass(store.category);
  }

  getStoreHRef(store) {
    const uniqueId = store.get('uniqueId').value;
    return `${location.origin}/casing?store-id=${uniqueId}`;
  }

  private initForm() {
    this.dataVerificationForm = this._rbs.getDataVerificationForm();
    this.dataVerificationForm.valueChanges
      .pipe(debounce(() => timer(500)))
      .subscribe(() => {
        this.updateSiteListItems();
        this._rbs.saveModel();
      });
    this.host.nativeElement.scrollTop = 0;
  }

  private updateSiteListItems() {
    (this.dataVerificationForm.get('stores') as FormArray).controls.forEach(siControl => {
      const mapKey = siControl.get('mapKey').value;
      const storeListItem: StoreListItem = this._rbs.getReportTableData().storeList.find(s => s.mapKey === mapKey);
      storeListItem.category = siControl.get('category').value;
      storeListItem.totalArea = siControl.get('totalArea').value;
      storeListItem.useTradeAreaChange = siControl.get('useTradeAreaChange').value;
      storeListItem.forceInclusion = siControl.get('forceInclusion').value;
    });
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}
