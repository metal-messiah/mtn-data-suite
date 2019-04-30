import { MatListOption } from '@angular/material';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { StoreList } from 'app/models/full/store-list';
import { StoreListService } from 'app/core/services/store-list.service';
import { AuthService } from 'app/core/services/auth.service';
import { StoreListSearchType } from 'app/core/functionalEnums/StoreListSearchType';
import { Pageable } from 'app/models/pageable';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { UserProfileService } from 'app/core/services/user-profile.service';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Pages } from './list-manager-pages';
import { SimplifiedUserProfile } from 'app/models/simplified/simplified-user-profile';
import { DbEntityMarkerService } from 'app/core/services/db-entity-marker.service';
import * as _ from 'lodash';


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
    listsAreDirty$: Subject<void> = new Subject();

    error$: Subject<{ title: string; error: any }> = new Subject();
    snackbar$: Subject<string> = new Subject();

    pages = Pages;
    page: Pages = Pages.LISTMANAGER;
    page$: BehaviorSubject<Pages> = new BehaviorSubject(this.page);

    scrollIntoViewId$: Subject<{ targetList: string, id: number }> = new Subject();

    userId: number;

    constructor(
        private storeListService: StoreListService,
        private authService: AuthService,
        private userProfileService: UserProfileService,
        private dbEntityMarkerService: DbEntityMarkerService
    ) {
        this.userId = this.authService.sessionUser.id;
    }

    setStores(stores: SimplifiedStore[]) {
        this.stores = stores;
        this.storesChanged$.next(this.stores);

        this.setPage(Pages.LISTMANAGER);

        this.refreshStoreLists();

    }

    setSelectedStoreList(storeList: SimplifiedStoreList, page?: Pages) {
        this.selectedStoreList = storeList;
        this.selectedStoreListChanged$.next(this.selectedStoreList);

        if (page) {
            this.setPage(page)
        }
    }

    refreshStoreLists() {
        this.fetchStoreLists();
    }

    refreshSelectedStoreList(storeList: SimplifiedStoreList) {
        if (this.selectedStoreList) {
            if (this.selectedStoreList.id === storeList.id) {
                this.setSelectedStoreList(storeList);
            }
        }
    }

    sortAndReturnStoreListObjectsAlphabetically(storeLists: SimplifiedStoreList[]): SimplifiedStoreList[] {

        storeLists.sort((a: SimplifiedStoreList, b: SimplifiedStoreList) => {
            const text1 = a.storeListName.toUpperCase();
            const text2 = b.storeListName.toUpperCase();
            return text1 < text2 ? -1 : text1 > text2 ? 1 : 0;
        });


        return storeLists;
    }

    sortStoreListsAlphabetically(): void {
        const targets = this.stores.length
            ? [this.includedStoreLists, this.excludedStoreLists]
            : [this.allStoreLists];
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

            this.includedStoreLists.forEach((storeList: SimplifiedStoreList) => {
                this.refreshSelectedStoreList(storeList);
            })
            this.excludedStoreLists.forEach((storeList: SimplifiedStoreList) => {
                this.refreshSelectedStoreList(storeList);
            })
        } else {
            this.allStoreListsChanged$.next(this.allStoreLists);

            this.allStoreLists.forEach((storeList: SimplifiedStoreList) => {
                this.refreshSelectedStoreList(storeList);
            })
        }

        this.listsAreDirty$.next();
    }

    filterLists(allStoreLists: SimplifiedStoreList[]) {
        this.allStoreLists = allStoreLists;
        this.includedStoreLists = allStoreLists.filter((storeList: SimplifiedStoreList) => {
            if (this.stores.length) {
                const storeIds = this.stores.map((store: SimplifiedStore) => store.id);
                const storeListStoreIds = storeList.storeIds;
                const hasMatches = _.intersectionWith(storeIds, storeListStoreIds, _.isEqual);
                return hasMatches.length;
            } else {
                return false
            }
        })
        this.excludedStoreLists = allStoreLists.filter((storeList: SimplifiedStoreList) => {
            if (this.stores.length) {
                const storeIds = this.stores.map((store: SimplifiedStore) => store.id);
                const storeListStoreIds = storeList.storeIds;
                const hasMatches = _.intersectionWith(storeIds, storeListStoreIds, _.isEqual);
                return hasMatches.length === 0;
            } else {
                return false
            }
        })

        this.sortStoreListsAlphabetically();
    }

    fetchStoreLists(storeIds?: number[]) {
        this.fetching$.next(true);
        const userId = this.userId;
        storeIds = storeIds && storeIds.length ? storeIds : null;
        const searchType = StoreListSearchType.ANY;

        const subscribed: Promise<Pageable<SimplifiedStoreList>> = this.storeListService
            .getStoreLists([userId], null, storeIds, null, searchType)
            .toPromise();
        const owned: Promise<Pageable<SimplifiedStoreList>> = this.storeListService
            .getStoreLists(null, userId, storeIds, null, searchType)
            .toPromise();

        const promises: Promise<Pageable<SimplifiedStoreList>>[] = [subscribed, owned];

        // loop through both sets and create includedStoreLists dataset
        Promise.all(promises).then((results: Pageable<SimplifiedStoreList>[]) => {
            const combined = Object.assign([], results[0].content, results[1].content);
            this.filterLists(combined.map((storeList) => new SimplifiedStoreList(storeList)));

            this.fetching$.next(false);

        });
    }

    getStoreLists(storeIds?: number[]): Observable<SimplifiedStoreList[]> {
        return Observable.create(observer => {
            if (this.allStoreLists.length) {
                observer.next(this.allStoreLists)
            } else {
                const userId = this.userId;
                storeIds = storeIds && storeIds.length ? storeIds : null;
                const searchType = StoreListSearchType.ANY;


                const subscribed: Promise<Pageable<SimplifiedStoreList>> = this.storeListService
                    .getStoreLists([userId], null, storeIds, null, searchType)
                    .toPromise();
                const owned: Promise<Pageable<SimplifiedStoreList>> = this.storeListService
                    .getStoreLists(null, userId, storeIds, null, searchType)
                    .toPromise();

                const promises: Promise<Pageable<SimplifiedStoreList>>[] = [subscribed, owned];

                // loop through both sets and create includedStoreLists dataset
                Promise.all(promises).then((results: Pageable<SimplifiedStoreList>[]) => {
                    const combined = Object.assign([], results[0].content, results[1].content);
                    const combinedObjs = combined.map((storeList) => new SimplifiedStoreList(storeList));

                    const sortedStoreLists = this.sortAndReturnStoreListObjectsAlphabetically(combinedObjs);
                    observer.next(sortedStoreLists);
                }).catch(err => observer.error(err));
            }
        })

    }

    setStoreListAsCurrentFilter(storeList: SimplifiedStoreList) {
        this.dbEntityMarkerService.controls.get('dataset').setValue(storeList);
    }

    storeListIsCurrentFilter(storeList: SimplifiedStoreList): boolean {
        return this.dbEntityMarkerService.controls.get('dataset').value.id === storeList.id
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
                        this.scrollIntoViewId$.next({ targetList, id: simpleStoreList.id })
                    }, 100);

                },
                (err) => this.error$.next({ title: 'Failed to Create New StoreList!!', error: err })
            );
        }
    }

    toggleSubscribe(storeList) {
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

    subscribe(user: SimplifiedUserProfile, storeList: SimplifiedStoreList) {
        this.userProfileService
            .subscribeToStoreListById(user.id, storeList.id)
            .subscribe((resp) => {
                this.snackbar$.next(`Subscribed ${user.name} to ${storeList.storeListName}`)
                this.refreshStoreLists();
            });
    }

    unsubscribe(user: SimplifiedUserProfile, storeList: SimplifiedStoreList) {
        this.userProfileService
            .unsubscribeToStoreListById(user.id, storeList.id)
            .subscribe((resp) => {
                this.snackbar$.next(`Unsubscribed ${user.name} from ${storeList.storeListName}`)
                this.refreshStoreLists();
            });
    }

    userIsSubscribedToStoreList(storeList: SimplifiedStoreList): boolean {
        return storeList.subscribers.findIndex((s) => s.id === this.userId) >= 0;
    }

    deleteList(storeList: SimplifiedStoreList): void {
        this.storeListService.delete(storeList.id).subscribe(() => {
            this.snackbar$.next(`Deleted ${storeList.storeListName}`);

            this.refreshStoreLists();
        });
    }

    removeFromList(storeLists: SimplifiedStoreList[], storeListStores: SimplifiedStore[]) {
        if (storeLists.length) {
            this.fetching$.next(true);
            const promises = [];
            storeLists.forEach((storeList: SimplifiedStoreList) => {
                const storeListId = storeList.id;
                const storeIds = storeListStores.map(s => s.id)

                promises.push(this.storeListService.removeStoresFromStoreList(storeListId, storeIds).toPromise());
            })

            Promise.all(promises)
                .then((results) => {

                    this.refreshStoreLists();
                    this.fetching$.next(false);
                })
                .catch(
                    (err) => {
                        this.error$.next({ title: 'Failed to Remove Stores from StoreList!', error: err });
                        this.fetching$.next(false);
                    }
                )
        }
    }

    addToList(selections?: MatListOption[], storeLists?: SimplifiedStoreList[], stores?: SimplifiedStore[]) {
        // const selections: MatListOption[] = this.selectionList.selectedOptions.selected;
        let selectedStoreLists: SimplifiedStoreList[] = [];
        stores = stores ? stores : this.stores;

        if (selections) {
            selectedStoreLists = selections.map((s) => s.value);
        }

        if (!selectedStoreLists.length && storeLists) {
            selectedStoreLists = storeLists;
        }

        if (selectedStoreLists.length && stores.length) {
            const promises = [];
            selectedStoreLists.forEach((storeList) => {
                const storeListId = storeList.id;
                const storeIds = stores.map((store) => store.id);

                promises.push(this.storeListService.addStoresToStoreList(storeListId, storeIds).toPromise());
            });

            Promise.all(promises)
                .then((results) => {
                    results.forEach((response: SimplifiedStoreList) => {
                        if (!this.userIsSubscribedToStoreList(response)) {
                            this.toggleSubscribe(response);
                        }
                    });

                    this.refreshStoreLists();
                    this.setPage(Pages.LISTMANAGER)
                })
                .catch(
                    (err) => this.error$.next({ title: 'Failed to Add Stores to StoreList!', error: err })
                );
        }
    }

    setPage(page: Pages) {
        this.page = page;
        this.page$.next(this.page);
    }

    getSelectedStoreList() {
        return this.selectedStoreList;
    }

    renameList(storeList: SimplifiedStoreList, newListName: string) {
        if (storeList.storeListName !== newListName) {

            this.storeListService.getOneById(storeList.id).subscribe((storeList: StoreList) => {
                storeList.storeListName = newListName;
                this.storeListService.update(storeList).subscribe((data) => {

                    this.refreshStoreLists();
                })
            })

        }
    }

}
