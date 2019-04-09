import { Component, Inject, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { ErrorService } from 'app/core/services/error.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ListManagerService } from './list-manager.service';
import { Pages } from './list-manager-pages';
import { Subscription } from 'rxjs';
import { MapService } from 'app/core/services/map.service';

@Component({
    selector: 'mds-list-manager',
    templateUrl: './list-manager.component.html',
    styleUrls: ['./list-manager.component.css'],
    providers: []
})
export class ListManagerComponent implements OnInit, OnDestroy {
    stores: SimplifiedStore[] = []; // list of stores (single/multiselect usually from casing app)

    allStoreLists: SimplifiedStoreList[] = [];
    includedStoreLists: SimplifiedStoreList[] = [];
    excludedStoreLists: SimplifiedStoreList[] = [];

    selectedStoreList: SimplifiedStoreList;

    subscriptions: Subscription[] = [];

    fetching: boolean;

    pages = Pages;
    page: Pages;

    @ViewChild('selectionList') selectionList: any;

    constructor(
        private listManagerService: ListManagerService,
        private errorService: ErrorService,
        public snackBar: MatSnackBar
    ) {
        console.log('set stores')
        this.listManagerService.setStores([]);
        this.createSubscriptions();

        // this.self.disableClose = true;
    }

    ngOnDestroy() {
        this.subscriptions.forEach((s: Subscription) => s.unsubscribe());
    }

    ngOnInit() { }

    createSubscriptions() {
        this.subscriptions.push(
            this.listManagerService.allStoreListsChanged$.subscribe((allStoreLists: SimplifiedStoreList[]) => {
                this.allStoreLists = allStoreLists;
            })
        );

        this.subscriptions.push(
            this.listManagerService.includedStoreListsChanged$.subscribe(
                (includedStoreLists: SimplifiedStoreList[]) => {
                    this.includedStoreLists = includedStoreLists;
                }
            )
        );

        this.subscriptions.push(
            this.listManagerService.excludedStoreListsChanged$.subscribe(
                (excludedStoreLists: SimplifiedStoreList[]) => {
                    this.excludedStoreLists = excludedStoreLists;
                }
            )
        );

        this.subscriptions.push(
            this.listManagerService.selectedStoreListChanged$.subscribe(
                (selectedStoreList: SimplifiedStoreList) => {
                    this.selectedStoreList = selectedStoreList;
                }
            )
        );

        this.subscriptions.push(
            this.listManagerService.storesChanged$.subscribe((stores: SimplifiedStore[]) => {
                this.stores = stores;
            })
        );

        this.subscriptions.push(
            this.listManagerService.fetching$.subscribe((fetching: boolean) => {
                this.fetching = fetching;
            })
        );

        this.subscriptions.push(
            this.listManagerService.error$.subscribe((data: { title: string; error: any }) => {
                this.errorService.handleServerError(data.title, data.error, () => console.log(data.error));
            })
        );

        this.subscriptions.push(
            this.listManagerService.snackbar$.subscribe((message: string) => {
                this.snackBar.open(message, null, {
                    duration: 2000,
                    verticalPosition: 'top'
                });
            })
        );

        this.subscriptions.push(
            this.listManagerService.page$.subscribe((page: Pages) => {
                this.page = page;
            })
        );

        this.subscriptions.push(
            this.listManagerService.scrollIntoViewId$.subscribe((identifier: { targetList: string; id: number }) => {
                this.scrollIntoView(identifier.targetList, identifier.id);
            })
        );
    }

    isPage(page: Pages) {
        return this.page === page;
    }

    scrollIntoView(targetList: string, storeListId: number): void {
        const selector = `${targetList}_${storeListId}`;
        const elem = document.getElementById(selector);
        if (elem) {
            elem.scrollIntoView({ behavior: 'smooth' });
        }
    }

    getStoreTitle(): string {
        if (this.stores.length === 1) {
            return `Store #${this.stores[0].id}`;
        } else {
            return `These ${this.stores.length.toLocaleString()} Selected Stores`;
        }
    }

    createNewList(listName: string) {
        this.listManagerService.createNewList(listName);
    }



    addToList() {
        this.listManagerService.addToList(this.selectionList.selectedOptions.selected);
    }

    setPage(page: Pages) {
        this.listManagerService.setPage(page);
    }

    clearStores() {
        this.listManagerService.setStores([]);
    }
}
