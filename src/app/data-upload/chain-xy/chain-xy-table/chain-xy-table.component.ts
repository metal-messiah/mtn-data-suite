import { Component, OnInit, ViewChild } from '@angular/core';
import { Sort, MatSidenav, MatDialog } from '@angular/material';

import { StoreSource } from 'app/models/full/store-source';
import { Router } from '@angular/router';
import { ChainXyService } from '../chain-xy-service.service';
import { SelectBannerComponent } from 'app/casing/select-banner/select-banner.component';
import { BannerSource } from 'app/models/full/banner-source';
import { BannerService } from 'app/core/services/banner.service';
import { Banner } from 'app/models/full/banner';

export enum statuses {
	COMPLETE,
	ALTERED,
	INCOMPLETE
}

class DummyData {
	data: BannerSource[] = [];
	constructor() {
		for (let i = 0; i < 25; i++) {
			const options = {
				id: i,
				sourceName: `ChainXY`,
				sourceNativeId: `${i}`,
				sourceUrl: '',
				sourceBannerName: `chain${i}`,
				sourceCreatedDate: new Date(),
				sourceEditedDate: new Date(),
				store: null,

				banner: null,

				validatedBy: null,
				validatedDate: this.getRandomDate(true),

				updatedDate: this.getRandomDate(false)
			};
			this.data.push(new BannerSource(options));
		}
	}

	getRandomDate(canBeNull) {
		if (canBeNull) {
			if (Math.random() > 0.5) {
				return null;
			}
		}
		return new Date(Number(new Date()) - Math.floor(Math.random() * 10000000000) - 10000000000);
	}
}

@Component({
	selector: 'mds-chain-xy-table',
	templateUrl: './chain-xy-table.component.html',
	styleUrls: [ './chain-xy-table.component.css' ]
})
export class ChainXyTableComponent implements OnInit {
	dummyData: BannerSource[];
	sortedData;

	selectedChain: StoreSource;

	statuses;

	saving = false;

	selectingBanner: number = null;

	@ViewChild('sidenav') sidenav: MatSidenav;

	constructor(
		private router: Router,
		private chainXyService: ChainXyService,
		private dialog: MatDialog,
		private bannerService: BannerService
	) {
		this.dummyData = new DummyData().data;

		this.assignStatuses();
	}

	ngOnInit() {}

	bannerSourceIsSelectingBanner(bannerSource) {
		return bannerSource.id === this.selectingBanner;
	}

	hasBanner(bs: BannerSource) {
		return bs.banner !== null;
	}

	selectBanner(bannerSource) {
		this.selectingBanner = bannerSource.id;
		const dialog = this.dialog.open(SelectBannerComponent, { maxWidth: '90%' });
		dialog.afterClosed().subscribe((result) => {
			if (result && result.bannerName) {
				this.updateBanner(result.id, bannerSource);
			} else if (result === 'remove') {
				this.removeBanner();
			} else {
				console.log(result);
			}
		});
	}

	updateBanner(bannerId: number, bannerSource: BannerSource) {
		this.saving = true;
		this.bannerService.getOneById(bannerId).subscribe((banner: Banner) => {
			// update the banner on the bannerSourceService
			// temporarily just updating the bannerSource obj
			this.selectingBanner = null;

			console.log(bannerId, bannerSource);
			bannerSource.banner = banner;
		});
	}

	removeBanner() {
		this.saving = true;
		// remove the banner on the bannerSourceService
	}

	getBannerImageSrc(banner) {
		return this.bannerService.getBannerImageSrc(banner);
	}

	assignStatuses() {
		this.sortedData = this.dummyData.map((d) => {
			const output: any = Object.assign({}, d);
			output.status = statuses.INCOMPLETE;
			if (d.validatedDate > d.updatedDate) {
				output.status = statuses.COMPLETE;
			}
			if (d.updatedDate > d.validatedDate) {
				output.status = statuses.ALTERED;
			}
			if (!d.validatedDate) {
				output.status = statuses.INCOMPLETE;
			}
			return output;
		});
	}

	getSelectedChainVal(key) {
		const val = this.selectedChain[key];
		let output;
		switch (key) {
			case 'banner':
				output = `${val.bannerName} (${val.stores.length.toLocaleString()} Stores)`;
				break;
			case 'updatedDate':
			case 'sourceCreatedDate':
			case 'sourceEditedDate':
			case 'validatedDate':
				output = new Date(val).toLocaleString();
				break;
			default:
				output = val;
		}
		return output;
	}

	toggleSidenav(item: StoreSource) {
		if (this.selectingBanner === null) {
			this.sidenav.toggle();
			this.selectedChain = item;
		}
	}

	getKeys(obj) {
		return Object.keys(obj);
	}

	getStatusColor(status: statuses) {
		if (status === 0) {
			return 'lightgreen';
		}
		if (status === 1) {
			return 'orange';
		}
		if (status === 2) {
			return 'red';
		}
	}

	sortData(sort: Sort) {
		const data = this.sortedData.slice();
		if (!sort.active || sort.direction === '') {
			this.sortedData = data;
			return;
		}

		this.sortedData = data.sort((a, b) => {
			const isAsc = sort.direction === 'asc';
			switch (sort.active) {
				case 'chain':
					return compare(a.sourceName, b.sourceName, isAsc);
				case 'status':
					return compare(a.status, b.status, isAsc);
				case 'validated':
					return compare(a.validatedDate, b.validatedDate, isAsc);
				case 'updated':
					return compare(a.updatedDate, b.updatedDate, isAsc);
				case 'banner':
					return compare(a.banner, b.banner, isAsc);
				default:
					return 0;
			}
		});
	}

	updateStores() {
		// send some data to the service here
		this.chainXyService.setSelectedChain(this.selectedChain);
		this.router.navigate([ 'data-upload/chain-xy/update' ]);
	}
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
	return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
