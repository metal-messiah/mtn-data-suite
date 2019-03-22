import { Component, Inject, OnInit, Input, ViewChild } from '@angular/core';
import { MatSnackBar, MAT_DIALOG_DATA, MatDialogRef, MatSelectionList, MatListOption } from '@angular/material';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { StoreList } from 'app/models/full/store-list';
import { StoreListService } from 'app/core/services/store-list.service';
import { AuthService } from 'app/core/services/auth.service';
import { StoreListSearchType } from 'app/core/functionalEnums/StoreListSearchType';
import { Pageable } from 'app/models/pageable';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { ErrorService } from 'app/core/services/error.service';
import { UserProfileService } from 'app/core/services/user-profile.service';

export enum Pages {
    LISTMANAGER,
    ADD
}

@Component({
    selector: 'mds-list-manager-dialog',
    templateUrl: './list-manager-dialog.component.html',
    styleUrls: [ './list-manager-dialog.component.css' ],
    providers: [ StoreListService, UserProfileService ]
})
export class ListManagerDialogComponent implements OnInit {
    stores: SimplifiedStore[] = []; // list of stores (single/multiselect usually from casing app)

    includedStoreLists: SimplifiedStoreList[] = [];
    excludedStoreLists: SimplifiedStoreList[] = [];

    pages = Pages;
    page: Pages = Pages.LISTMANAGER;

    @ViewChild('selectionList') selectionList: any;

    constructor(
        snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<ErrorDialogComponent>,
        private self: MatDialogRef<ListManagerDialogComponent>,
        private errorService: ErrorService,
        private storeListService: StoreListService,
        private userProfileService: UserProfileService,
        private authService: AuthService,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            stores: SimplifiedStore[];
        }
    ) {
        this.stores = data.stores;

        this.getIncludedStoreLists();
        this.getExcludedStoreLists();

        this.self.disableClose = true;
    }

    ngOnInit() {}

    getIncludedStoreLists() {
        const promises: Promise<Pageable<SimplifiedStoreList>>[] = [];
        const userId = this.authService.sessionUser.id;
        const storeIds = this.stores.map((store) => store.id);
        const searchType = StoreListSearchType.ANY;

        // subscribed storeLists
        promises.push(this.storeListService.getStoreLists([ userId ], null, storeIds, null, searchType).toPromise());
        // owned storeLists
        promises.push(this.storeListService.getStoreLists(null, userId, storeIds, null, searchType).toPromise());

        // loop through both sets and create includedStoreLists
        Promise.all(promises).then((results: Pageable<SimplifiedStoreList>[]) => {
            const combined = Object.assign([], results[0].content, results[1].content);
            this.includedStoreLists = combined.map((storeList) => new SimplifiedStoreList(storeList));
        });
    }

    getExcludedStoreLists() {
        const userId = this.authService.sessionUser.id;
        const storeIds = this.stores.map((store) => store.id);
        const searchType = StoreListSearchType.ANY;
        this.storeListService.getStoreLists(null, userId, null, storeIds, searchType).subscribe(
            (pageable: Pageable<SimplifiedStoreList>) => {
                this.excludedStoreLists = pageable.content.map((storeList) => new SimplifiedStoreList(storeList));
            },
            (err) => this.errorService.handleServerError('Failed to Get StoreLists!', err, () => console.log(err))
        );
    }

    createNewStoreList(listName: string) {
        if (listName) {
            const newStoreList: StoreList = new StoreList({ storeListName: listName });
            this.storeListService.create(newStoreList).subscribe(
                (storeList: StoreList) => {
                    this.excludedStoreLists.unshift(new SimplifiedStoreList(storeList));
                    setTimeout(() => {
                        this.selectionList.options.first.toggle();
                    }, 100);
                },
                (err) =>
                    this.errorService.handleServerError('Failed to Create New StoreList!', err, () => console.log(err))
            );
        }
    }

    addToList() {
        const selections: MatListOption[] = this.selectionList.selectedOptions.selected;
        const selectedStoreLists: SimplifiedStoreList[] = selections.map((s) => s.value);
        if (selections.length && this.stores) {
            const promises = [];
            selectedStoreLists.forEach((storeList) => {
                const storeListId = storeList.id;
                const storeIds = this.stores.map((store) => store.id);

                promises.push(this.storeListService.addStoresToStoreList(storeListId, storeIds).toPromise());
            });

            Promise.all(promises)
                .then((results) => {
                    results.forEach((response: SimplifiedStoreList) => {
                        this.subscribeToList(response);
                    });

                    this.getIncludedStoreLists();
                    this.page = Pages.LISTMANAGER;
                })
                .catch((err) =>
                    this.errorService.handleServerError('Failed to Add Stores to StoreList!', err, () =>
                        console.log(err)
                    )
                );
        }
    }

    subscribeToList(storeList) {
        this.userProfileService
            .subscribeToStoreListById(this.authService.sessionUser.id, storeList.id)
            .subscribe((resp) => {
                console.log(resp);
            });
    }

    setPage(page: Pages) {
        this.page = page;
    }

    getStoreTitle(): string {
        if (this.stores.length === 1) {
            return `Store #${this.stores[0].id}`;
        } else {
            return `These ${this.stores.length.toLocaleString()} Selected Stores`;
        }
    }
}
