// UTILITIES
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
// SERVICES
import { BannerService } from 'app/core/services/banner.service';
import { BannerSourceService } from 'app/core/services/banner-source.service';
// COMPONENTS
import { SelectBannerComponent } from 'app/casing/select-banner/select-banner.component';
// MODELS
import { Pageable } from 'app/models/pageable';
import { BannerSourceSummary } from '../../models/full/banner-source-summary';
import { ErrorService } from '../../core/services/error.service';
import { CloudinaryUtil } from '../../utils/cloudinary-util';
import { Location } from '@angular/common';
import { MatDialog, MatSidenav, MatSnackBar, Sort } from '@angular/material';

export enum statuses {
  COMPLETE = 'COMPLETE',
  DELETED = 'DELETED',
  INCOMPLETE = 'INCOMPLETE'
}

@Component({
  selector: 'mds-chain-xy-table',
  templateUrl: './chain-xy-table.component.html',
  styleUrls: ['./chain-xy-table.component.css']
})
export class ChainXyTableComponent implements OnInit {
  bannerSourceSummaries: BannerSourceSummary[];

  selectedBannerSourceSummary: BannerSourceSummary;

  selectingBanner: number = null;

  fuzzyKeys: string[] = ['sourceBannerName'];
  fuzzyResults: BannerSourceSummary[];

  sideNavOpened = false;

  sort: Sort;

  @ViewChild('sidenav', { static: false }) sidenav: MatSidenav;

  private readonly cloudinaryUtil: CloudinaryUtil;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private bannerService: BannerService,
    private bannerSourceService: BannerSourceService,
    private snackBar: MatSnackBar,
    private errorService: ErrorService,
    private _location: Location
  ) {
    this.cloudinaryUtil = new CloudinaryUtil();
  }

  goBack() {
    this._location.back();
  }

  ngOnInit() {
    this.getBannerSourceSummaries();
  }

  getUrlForLogoFileName(fileName: string) {
    return this.cloudinaryUtil.getUrlForLogoFileName(fileName);
  }

  getFilteredBannerSourceSummaries() {
    const records = this.fuzzyResults || this.bannerSourceSummaries;
    if (this.sort) {
      records.sort((a, b) => {
        return this.compare(a[this.sort.active], b[this.sort.active], this.sort.direction === 'asc');
      });
    }
    return records;
  }

  /***
   * Triggered when bannerSourceSummaries list changes
   * @param results
   */
  handleFuzzySearch(output: [any[], string]) {
    const [results, term] = output;
    this.fuzzyResults = results.length > 0 ? results : null;
  }

  selectBanner(event, bannerSourceSummary: BannerSourceSummary) {
    event.stopPropagation();
    const dialog = this.dialog.open(SelectBannerComponent, { maxWidth: '90%' });
    dialog.afterClosed().subscribe(result => {
      this.selectingBanner = null;
      if (result && result.bannerName) {
        this.assignBanner(result.id, bannerSourceSummary);
      } else if (result === 'remove') {
        this.removeBanner(bannerSourceSummary);
      } else {
        // do nothing for now
      }
    });
  }

  assignBanner(bannerId: number, bannerSourceSummary: BannerSourceSummary) {
    bannerSourceSummary['saving'] = true;
    this.bannerSourceService.assignBanner(bannerSourceSummary.id, bannerId).subscribe(
      () => {
        this.snackBar.open('Successfully assigned banner', null, { duration: 1000 });
        this.getBannerSourceSummaries();
      },
      err =>
        this.errorService.handleServerError(
          'Failed to assign banner!',
          err,
          () => console.log(err),
          () => this.assignBanner(bannerId, bannerSourceSummary)
        )
    );
  }

  removeBanner(bannerSourceSummary: BannerSourceSummary) {
    bannerSourceSummary['saving'] = true;
    this.bannerSourceService.unassignBanner(bannerSourceSummary.id).subscribe(
      () => {
        this.snackBar.open('Successfully unassigned banner', null, { duration: 1000 });
        this.getBannerSourceSummaries();
      },
      err =>
        this.errorService.handleServerError(
          'Failed to assign banner!',
          err,
          () => console.log(err),
          () => this.removeBanner(bannerSourceSummary)
        )
    );
  }

  openSideNav(bs: BannerSourceSummary) {
    this.selectedBannerSourceSummary = bs;
    this.sideNavOpened = true;
  }

  getStatusClass(status: string) {
    switch (status) {
      case statuses.COMPLETE:
        return 'fas fa-check-circle lightgreen';
      case statuses.INCOMPLETE:
        return 'fas fa-exclamation-triangle orange';
      case statuses.DELETED:
        return 'fas fa-exclamation-circle red';
      default:
        return '';
    }
  }

  sortData(sort: Sort) {
    this.sort = sort;
  }

  private getBannerSourceSummaries() {
    const queryParams = { 'source-name': 'ChainXy' };
    this.bannerSourceService.getAllByQuery(queryParams, null, 1000).subscribe((resp: Pageable<any>) => {
      this.bannerSourceSummaries = resp.content;
      // update fuzzy results
      if (this.fuzzyResults) {
        this.fuzzyResults = this.fuzzyResults.map(bss => this.bannerSourceSummaries.find(b => b.id === bss.id));
      }
    });
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
