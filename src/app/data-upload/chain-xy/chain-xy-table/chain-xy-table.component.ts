// UTILITIES
import { Component, OnInit, ViewChild } from '@angular/core';
import { Sort, MatSidenav, MatDialog } from '@angular/material';
import { Router } from '@angular/router';

// SERVICES
import { ChainXyService } from '../chain-xy.service';
import { BannerService } from 'app/core/services/banner.service';
import { BannerSourceService } from 'app/core/services/banner-source.service';

// COMPONENTS
import { SelectBannerComponent } from 'app/casing/select-banner/select-banner.component';

// MODELS
import { BannerSource } from 'app/models/full/banner-source';
import { Banner } from 'app/models/full/banner';
import { Pageable } from 'app/models/pageable';
import { SimplifiedBannerSource } from 'app/models/simplified/simplified-banner-source';

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
  bannerSources: SimplifiedBannerSource[];
  sortedData: any[];

  selectedBannerSource: any;

  saving = false;

  selectingBanner: number = null;

  fuzzyKeys: string[] = ['sourceBannerName'];

  bannerImages = {};

  @ViewChild('sidenav') sidenav: MatSidenav;

  constructor(
    private router: Router,
    private chainXyService: ChainXyService,
    private dialog: MatDialog,
    private bannerService: BannerService,
    private bannerSourceService: BannerSourceService
  ) {
    this.bannerSourceService
      .getAllByQuery(`source_name = 'ChainXY`, null, 1000)
      .subscribe((resp: Pageable<any>) => {
        this.bannerSources = resp.content;
        this.setDefaultSortedData();
      });
  }

  ngOnInit() {
  }

  setDefaultSortedData() {
    this.sortedData = Object.assign([], this.bannerSources);
  }

  handleFuzzySearch(results) {
    if (results.length) {
      this.sortedData = Object.assign([], results);
    } else {
      this.setDefaultSortedData();
    }
  }

  bannerSourceIsSelectingBanner(bannerSource) {
    return bannerSource.id === this.selectingBanner;
  }

  hasBanner(bs: BannerSource) {
    return bs.banner !== null;
  }

  selectBanner(bannerSource: SimplifiedBannerSource) {
    this.selectingBanner = bannerSource.id;
    const dialog = this.dialog.open(SelectBannerComponent, { maxWidth: '90%' });
    dialog.afterClosed().subscribe((result) => {
      this.selectingBanner = null;
      if (result && result.bannerName) {
        this.updateBanner(result.id, bannerSource);
      } else if (result === 'remove') {
        this.removeBanner();
      } else {
        // do nothing for now
      }
    });
  }

  updateBanner(bannerId: number, bannerSource) {
    this.saving = true;
    this.bannerService.getOneById(bannerId).subscribe((banner: Banner) => {
      const { bannerName, id, logoFileName } = banner;

      this.bannerSourceService.getOneById(bannerSource.id).subscribe((fullBannerSource: BannerSource) => {
        bannerSource.banner = {
          bannerName,
          id,
          logoFileName
        };
        fullBannerSource.banner = bannerSource.banner;
        this.bannerSourceService.update(fullBannerSource).subscribe(
          (resp) => {
            console.log('updated ', resp);
          },
          (err) => console.error(err)
        );
      });
    });
  }

  removeBanner() {
    this.saving = true;
    // remove the banner on the bannerSourceService
  }

  fileExists(urlToFile, id, strictCheck) {
    // we want to strict check (call to the remote resource) as few times as possible,
    // so store the responses statefully so that re-renders wont retrigger
    if (strictCheck) {
      const splitFile = urlToFile.split('.');
      if (splitFile[splitFile.length - 2].endsWith('null')) {
        return false;
      }
      const xhr = new XMLHttpRequest();
      xhr.open('HEAD', urlToFile, false);
      xhr.send();

      if (xhr.status === 404) {
        this.bannerImages[id].valid = false;

        return false;
      } else {
        this.bannerImages[id].valid = true;
        return true;
      }
    } else {
      if (this.bannerImages[id]) {
        if (typeof this.bannerImages[id].valid !== 'undefined') {
          return this.bannerImages[id].valid;
        }
      }

      return this.fileExists(urlToFile, id, true);
    }
  }

  getBannerImageSrc(banner) {
    const imgSource = this.bannerService.getBannerImageSrc(banner);
    if (!this.bannerImages[banner.id]) {
      this.bannerImages[banner.id] = {};
    }
    this.bannerImages[banner.id].url = imgSource;
    return imgSource;
  }

  getSelectedBannerSourceVal(key) {
    const val = this.selectedBannerSource[key];
    switch (key) {
      case 'banner':
        return `${val.bannerName} (${this.selectedBannerSource.storeSourceCount} Stores)`;
      case 'updatedDate':
      case 'sourceCreatedDate':
      case 'sourceEditedDate':
      case 'validatedDate':
        return new Date(val).toLocaleString();
      case 'createdBy':
      case 'updatedBy':
      // do nothing for now
      default:
        return val;
    }
  }

  toggleSidenav(sbs: SimplifiedBannerSource) {
    if (this.selectingBanner === null) {
      this.sidenav.toggle();
      this.bannerSourceService.getOneById(sbs.id).subscribe((fbs: BannerSource) => {
        this.selectedBannerSource = Object.assign({}, sbs, fbs);
      });
    }
  }

  getStatusColor(status: string) {
    switch (status) {
      case statuses.COMPLETE:
        return 'lightgreen';
      case statuses.DELETED:
        return 'orange';
      case statuses.INCOMPLETE:
        return 'red';
      default:
        return '';
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case statuses.COMPLETE:
        return 'fas fa-check-circle';
      case statuses.INCOMPLETE:
        return 'fas fa-exclamation-triangle';
      case statuses.DELETED:
        return 'fas fa-exclamation-circle';
      default:
        return '';
    }
  }

  sortData(sort: Sort) {
    const data = this.sortedData.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
    } else {
      this.sortedData = data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'chain':
            return this.compare(a.sourceName, b.sourceName, isAsc);
          case 'status':
            return this.compare(a.status, b.status, isAsc);
          case 'validated':
            return this.compare(a.validatedDate, b.validatedDate, isAsc);
          case 'updated':
            return this.compare(a.updatedDate, b.updatedDate, isAsc);
          case 'banner':
            return this.compare(a.banner, b.banner, isAsc);
          default:
            return 0;
        }
      });
    }
  }

  skipAll() {
    // clear the service state
    this.chainXyService.setSelectedBannerSource(null);
    this.router.navigate(['data-upload/chain-xy/update']);
  }

  updateStores() {
    // send some data to the service here
    this.chainXyService.setSelectedBannerSource(this.selectedBannerSource);
    this.router.navigate(['data-upload/chain-xy/update']);
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  };
}


