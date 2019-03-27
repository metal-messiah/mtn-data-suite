import { MatSnackBar, MatDialogRef, MatListOption, MatDialog } from '@angular/material';
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
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Pages } from './list-manager-pages';


@Injectable()
export class ListManagerService {
    stores: SimplifiedStore[] = []; // list of stores (single/multiselect usually from casing app)
    storesChanged$: BehaviorSubject<SimplifiedStore[]> = new BehaviorSubject(this.stores);

    allStoreLists: SimplifiedStoreList[] = [];
    allStoreListsChanged$: BehaviorSubject<SimplifiedStoreList[]> = new BehaviorSubject(this.allStoreLists);

    includedStoreLists: SimplifiedStoreList[] = [];
    includedStoreListsChanged$: BehaviorSubject<SimplifiedStoreList[]> = new BehaviorSubject(this.includedStoreLists);

    excludedStoreLists: SimplifiedStoreList[] = [];
    excludedStoreListsChanged$: BehaviorSubject<SimplifiedStoreList[]> = new BehaviorSubject(this.excludedStoreLists);

    selectedStoreList: SimplifiedStoreList;
    selectedStoreListChanged$: BehaviorSubject<SimplifiedStoreList> = new BehaviorSubject(this.selectedStoreList);

    fetching$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    error$: Subject<{ title: string; error: any }> = new Subject();
    snackbar$: Subject<string> = new Subject();

    pages = Pages;
    page: Pages = Pages.LISTMANAGER;
    page$: BehaviorSubject<Pages> = new BehaviorSubject(this.page);
    
    scrollIntoViewId$: Subject<{targetList: string, id: number}> = new Subject();

    userId: number;

    constructor(
        private storeListService: StoreListService,
        private authService: AuthService,
        private userProfileService: UserProfileService
    ) {
        this.userId = this.authService.sessionUser.id;
        console.log('created list-manager-service for user: ', this.userId);
    }

    setStores(stores: SimplifiedStore[]) {
        this.stores = stores;
        this.storesChanged$.next(this.stores);

        this.page = Pages.LISTMANAGER;
        this.page$.next(this.page);

        this.refreshStoreLists();
        
    }

    setSelectedStoreList(storeList: SimplifiedStoreList) {
        this.selectedStoreList = storeList;
        this.selectedStoreListChanged$.next(this.selectedStoreList);
        this.page = Pages.VIEWSTORES;
        this.page$.next(this.page);
    }

    refreshStoreLists() {
        if (this.stores.length) {
            this.getIncludedStoreLists();
            this.getExcludedStoreLists();
        } else {
            this.getAllStoreLists();
        }
    }

    sortStoreListsAlphabetically(): void {
        const targets = this.stores.length
            ? [ this.includedStoreLists, this.excludedStoreLists ]
            : [ this.allStoreLists ];
        targets.forEach((storeList: SimplifiedStoreList[]) => {
            storeList.sort((a: SimplifiedStoreList, b: SimplifiedStoreList) => {
                const text1 = a.storeListName.toUpperCase();
                const text2 = b.storeListName.toUpperCase();
                return text1 < text2 ? -1 : text1 > text2 ? 1 : 0;
            });
        });

        if (this.stores.length) {
            this.includedStoreListsChanged$.next(this.includedStoreLists);
            this.excludedStoreListsChanged$.next(this.excludedStoreLists);
        } else {
            this.allStoreListsChanged$.next(this.allStoreLists);
        }
    }

    getAllStoreLists() {
        this.fetching$.next(true);
        const userId = this.userId;
        const storeIds = null;
        const searchType = StoreListSearchType.ANY;

        const subscribed: Promise<Pageable<SimplifiedStoreList>> = this.storeListService
            .getStoreLists([ userId ], null, storeIds, null, searchType)
            .toPromise();
        const owned: Promise<Pageable<SimplifiedStoreList>> = this.storeListService
            .getStoreLists(null, userId, storeIds, null, searchType)
            .toPromise();

        const promises: Promise<Pageable<SimplifiedStoreList>>[] = [ subscribed, owned ];

        // loop through both sets and create includedStoreLists dataset
        Promise.all(promises).then((results: Pageable<SimplifiedStoreList>[]) => {
            const combined = Object.assign([], results[0].content, results[1].content);
            this.allStoreLists = combined.map((storeList) => new SimplifiedStoreList(storeList));
            this.sortStoreListsAlphabetically();
            this.fetching$.next(false);
        });
    }

    getIncludedStoreLists() {
        this.fetching$.next(true);
        const userId = this.userId;
        const storeIds = this.stores.map((store) => store.id);
        const searchType = StoreListSearchType.ANY;

        const subscribed: Promise<Pageable<SimplifiedStoreList>> = this.storeListService
            .getStoreLists([ userId ], null, storeIds, null, searchType)
            .toPromise();
        const owned: Promise<Pageable<SimplifiedStoreList>> = this.storeListService
            .getStoreLists(null, userId, storeIds, null, searchType)
            .toPromise();

        const promises: Promise<Pageable<SimplifiedStoreList>>[] = [ subscribed, owned ];

        // loop through both sets and create includedStoreLists dataset
        Promise.all(promises).then((results: Pageable<SimplifiedStoreList>[]) => {
            const combined = Object.assign([], results[0].content, results[1].content);
            this.includedStoreLists = combined.map((storeList) => new SimplifiedStoreList(storeList));
            this.sortStoreListsAlphabetically();
            this.fetching$.next(false);
        });
    }

    getExcludedStoreLists() {
        const userId = this.userId;
        const storeIds = this.stores.map((store) => store.id);
        const searchType = StoreListSearchType.ANY;
        this.storeListService.getStoreLists(null, userId, null, storeIds, searchType).subscribe(
            (pageable: Pageable<SimplifiedStoreList>) => {
                this.excludedStoreLists = pageable.content.map((storeList) => new SimplifiedStoreList(storeList));
                this.sortStoreListsAlphabetically();
            },
            (err) => this.error$.next({ title: 'Failed to Fetch Excluded Store Lists!!', error: err })
        );
    }

    createNewList(listName: string) {
        if (listName) {
            const newStoreList: StoreList = new StoreList({ storeListName: listName });
            this.storeListService.create(newStoreList).subscribe(
                (storeList: StoreList) => {
                    const targetList = this.stores.length ? 'excluded' : 'all';
                    const simpleStoreList = new SimplifiedStoreList(storeList);
                    if (targetList === 'excluded') {
                        this.excludedStoreLists.push(simpleStoreList);
                    } else {
                        this.allStoreLists.push(simpleStoreList);
                    }
                    this.sortStoreListsAlphabetically();
                    setTimeout(() => {
                        this.scrollIntoViewId$.next({targetList, id: simpleStoreList.id})
                    }, 100);
                    
                },
                (err) => this.error$.next({ title: 'Failed to Create New StoreList!!', error: err })
            );
        }
    }

    toggleSubscribe(storeList) {
        console.log('toggle')
        if (this.userIsSubscribedToStoreList(storeList)) {
            this.userProfileService.unsubscribeToStoreListById(this.userId, storeList.id).subscribe(resp => {
                this.snackbar$.next(`Unsubscribed from ${storeList.storeListName}`)
                this.refreshStoreLists();
            })
        } else {
            this.userProfileService
                .subscribeToStoreListById(this.userId, storeList.id)
                .subscribe((resp) => {
                    this.snackbar$.next(`Subscribed to ${storeList.storeListName}`)
                    this.refreshStoreLists();
                });
        }
    }

    userIsSubscribedToStoreList(storeList: SimplifiedStoreList): boolean {
        return storeList.subscribers.findIndex((s) => s.id === this.userId) >= 0;
    }

    deleteList(storeList: SimplifiedStoreList): void {
        this.storeListService.delete(storeList.id).subscribe(() => {
            this.snackbar$.next(`Deleted Store #${storeList.id}`);

            this.refreshStoreLists();
        });
    }

    addToList(selections: MatListOption[]) {
        // const selections: MatListOption[] = this.selectionList.selectedOptions.selected;
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
                        this.toggleSubscribe(response);
                    });

                    this.getIncludedStoreLists();
                    this.page = Pages.LISTMANAGER;
                    this.page$.next(this.page);
                })
                .catch(
                    (err) => this.error$.next({ title: 'Failed to Add Stores to StoreList!', error: err })
                    // this.errorService.handleServerError('Failed to Add Stores to StoreList!', err, () =>
                    //     console.log(err)
                    // )
                );
        }
    }
    
    setPage(page: Pages) {
        this.page = page;
        this.page$.next(this.page);
    }
}
