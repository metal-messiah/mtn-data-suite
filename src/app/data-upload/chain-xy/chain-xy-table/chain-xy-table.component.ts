import { Component, OnInit, ViewChild } from '@angular/core';
import { Sort, MatSidenav } from '@angular/material';

import { StoreSource } from 'app/models/full/store-source';
import { Router } from '@angular/router';

export enum statuses {
	COMPLETE,
	ALTERED,
	INCOMPLETE
}

class DummyData {
	data: StoreSource[] = [];
	constructor() {
		for (let i = 0; i < 25; i++) {
			const options = {
				sourceName: `Chain Name ${i}`,
				sourceNativeId: `${i}`,
				sourceUrl: '',
				sourceStoreName: `store${i}`,
				sourceCreatedDate: new Date(),
				sourceEditedDate: new Date(),
				store: null,

				banner: null,

				validatedBy: null,
				validatedDate: this.getRandomDate(true),

				updatedDate: this.getRandomDate(false)
			};
			this.data.push(new StoreSource(options));
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
	dummyData: StoreSource[];
	sortedData;

	selectedChain: StoreSource;

	statuses;

	@ViewChild('sidenav') sidenav: MatSidenav;

	constructor(private router: Router) {
		this.dummyData = new DummyData().data;

		this.assignStatuses();
	}

	ngOnInit() {}

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

	toggleSidenav(item: StoreSource) {
		this.sidenav.toggle();
		this.selectedChain = item;
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
		// send some data to the service
		this.router.navigate([ 'chain-xy/update' ]);
	}
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
	return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
