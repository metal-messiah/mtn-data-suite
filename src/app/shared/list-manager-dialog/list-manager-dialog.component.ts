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
    subscribedIncludedStoreLists: SimplifiedStoreList[] = [];
    createdIncludedStoreLists: SimplifiedStoreList[] = [];
    excludedStoreLists: SimplifiedStoreList[] = [];

    pages = Pages;
    page: Pages = Pages.LISTMANAGER;

    @ViewChild('selectionList') selectionList: any;

    constructor(
        snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<ErrorDialogComponent>,
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
    }

    ngOnInit() {}

    getIncludedStoreLists() {
        const promises: Promise<Pageable<SimplifiedStoreList>>[] = [];
        promises.push(
            this.storeListService
                .getStoreLists(
                    [ this.authService.sessionUser.id ],
                    null,
                    this.stores.map((store) => store.id),
                    null,
                    StoreListSearchType.ANY
                )
                .toPromise()
        );

        promises.push(
            this.storeListService
                .getStoreLists(
                    null,
                    this.authService.sessionUser.id,
                    this.stores.map((store) => store.id),
                    null,
                    StoreListSearchType.ANY
                )
                .toPromise()
        );

        Promise.all(promises).then((results: Pageable<SimplifiedStoreList>[]) => {
            const combined = Object.assign([], results[0].content, results[1].content);
            this.includedStoreLists = combined.map((storeList) => new SimplifiedStoreList(storeList));
            // results.forEach((pageable: Pageable<SimplifiedStoreList>) => {
            //     pageable.content.forEach((storeList: SimplifiedStoreList) => {
            //         this.includedStoreLists.push(new SimplifiedStoreList(storeList));
            //     });
            // });

            console.log(this.includedStoreLists);
        });
    }

    getExcludedStoreLists() {
        this.storeListService
            .getStoreLists(
                null,
                this.authService.sessionUser.id,
                null,
                this.stores.map((store) => store.id),
                StoreListSearchType.ANY
            )
            .subscribe(
                (pageable: Pageable<SimplifiedStoreList>) => {
                    this.excludedStoreLists = pageable.content.map((storeList) => new SimplifiedStoreList(storeList));
                },
                (err) => this.errorService.handleServerError('Failed to Get StoreLists!', err, () => console.log(err))
            );
    }

    createNewStoreList(listName: string) {
        if (listName) {
            const newStoreList: StoreList = new StoreList({ storeListName: listName });
            console.log(newStoreList);
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
            selectedStoreLists.forEach((storeList) => {
                const storeListId = storeList.id;
                const storeIds = this.stores.map((store) => store.id);

                this.storeListService.addStoresToStoreList(storeListId, storeIds).subscribe(
                    (response: SimplifiedStoreList) => {
                        this.getIncludedStoreLists();
                        this.subscribeToList(response);
                        this.page = Pages.LISTMANAGER;
                    },
                    (err) =>
                        this.errorService.handleServerError('Failed to Add Stores to StoreList!', err, () =>
                            console.log(err)
                        )
                );
            });
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
}
