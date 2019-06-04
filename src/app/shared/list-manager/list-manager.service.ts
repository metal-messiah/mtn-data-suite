import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { StoreList } from 'app/models/full/store-list';
import { StoreListService } from 'app/core/services/store-list.service';
import { AuthService } from 'app/core/services/auth.service';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { UserProfileService } from 'app/core/services/user-profile.service';
import { BehaviorSubject, forkJoin, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { ListManagerViews } from './list-manager-views';
import { DbEntityMarkerService } from 'app/core/services/db-entity-marker.service';
import { finalize } from 'rxjs/operators';
import { ErrorService } from '../../core/services/error.service';


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

  saving = false;
  fetching = false;
  listsAreDirty$: Subject<void> = new Subject();

  snackbar$: Subject<string> = new Subject();

  view: ListManagerViews = ListManagerViews.LISTMANAGER;
  page$: BehaviorSubject<ListManagerViews> = new BehaviorSubject(this.view);

  scrollIntoViewId$: Subject<{ targetList: string, id: number }> = new Subject();

  userId: number;

  constructor(
    private storeListService: StoreListService,
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private dbEntityMarkerService: DbEntityMarkerService,
    private errorService: ErrorService
  ) {
    this.userId = this.authService.sessionUser.id;


  }

  setStores(stores: SimplifiedStore[]) {
    this.stores = stores;
    this.storesChanged$.next(this.stores);

    this.setView(ListManagerViews.LISTMANAGER);

    this.refreshStoreLists();

  }

  setSelectedStoreList(storeList: SimplifiedStoreList, page?: ListManagerViews) {
    this.selectedStoreList = storeList;
    this.selectedStoreListChanged$.next(this.selectedStoreList);

    if (page) {
      this.setView(page)
    }
  }

  refreshStoreLists() {
    // this.fetchStoreLists();
  }

  refreshSelectedStoreList(storeList: SimplifiedStoreList) {
    if (this.selectedStoreList) {
      if (this.selectedStoreList.id === storeList.id) {
        this.setSelectedStoreList(storeList);
      }
    }
  }

  sortStoreListsAlphabetically(): void {
    const targets = this.stores.length ? [this.includedStoreLists, this.excludedStoreLists] : [this.allStoreLists];
    targets.forEach((storeList: SimplifiedStoreList[]) => {
      storeList.sort((a: SimplifiedStoreList, b: SimplifiedStoreList) => {
        return a.storeListName.toUpperCase().localeCompare(b.storeListName.toUpperCase());
      });
    });

    if (this.stores.length) {
      this.includedStoreListsChanged$.next(this.includedStoreLists);
      this.excludedStoreListsChanged$.next(this.excludedStoreLists);

      this.includedStoreLists.forEach((storeList: SimplifiedStoreList) => {
        this.refreshSelectedStoreList(storeList);
      });
      this.excludedStoreLists.forEach((storeList: SimplifiedStoreList) => {
        this.refreshSelectedStoreList(storeList);
      });
    } else {
      this.allStoreListsChanged$.next(this.allStoreLists);

      this.allStoreLists.forEach((storeList: SimplifiedStoreList) => {
        this.refreshSelectedStoreList(storeList);
      });
    }

    this.listsAreDirty$.next();
  }

  setStoreListAsCurrentFilter(storeList: SimplifiedStoreList) {
    this.dbEntityMarkerService.controls.storeList = storeList;
    this.dbEntityMarkerService.refreshMarkers();
  }

  storeListIsCurrentFilter(storeList: SimplifiedStoreList): boolean {
    const selectedList = this.dbEntityMarkerService.controls.storeList;
    return selectedList && selectedList.id === storeList.id
  }

  createNewList(listName: string) {
    if (listName) {
      const newStoreList: StoreList = new StoreList({storeListName: listName});
      this.saving = true;
      this.storeListService.create(newStoreList)
        .pipe(finalize(() => this.saving = false))
        .subscribe((storeList: StoreList) => {
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
          (err) => this.errorService.handleServerError('Failed to Create New Store List!', err,
            () => console.log(err), () => this.createNewList(listName))
        );
    }
  }

  deleteList(storeList: SimplifiedStoreList): void {
    this.storeListService.delete(storeList.id).subscribe(() => {
      this.snackbar$.next(`Deleted ${storeList.storeListName}`);
      this.refreshStoreLists();
      this.refreshMapFilter(null);
    });
  }

  refreshMapFilter(storeLists: SimplifiedStoreList[]) {
    if (storeLists) {
      storeLists.forEach((storeList: SimplifiedStoreList) => {
        if (this.storeListIsCurrentFilter(storeList)) {
          this.storeListService.getOneById(storeList.id).subscribe((sl: StoreList) => {
            this.setStoreListAsCurrentFilter(new SimplifiedStoreList(sl))
          });
        }
      })
    } else {
      // LIST DELETED, SET MAP TO ALL POINTS!
      this.setStoreListAsCurrentFilter(null);
    }
  }

  removeFromList(storeLists: SimplifiedStoreList[], storeListStores: SimplifiedStore[]) {
    if (storeLists.length && storeListStores.length) {

      const observables = [];
      storeLists.forEach((storeList: SimplifiedStoreList) => {
        const storeListId = storeList.id;
        const storeIds = storeListStores.map(s => s.id);

        observables.push(this.storeListService.removeStoresFromStoreList(storeListId, storeIds));
      });

      this.fetching = true;
      forkJoin(observables)
        .pipe(finalize(() => this.fetching = false))
        .subscribe(() => {
            this.refreshStoreLists();
            this.refreshMapFilter(storeLists);
          },
          err => this.errorService.handleServerError('Failed to remove stores from lists!', err,
            () => console.log(err), () => this.removeFromList(storeLists, storeListStores)));
    }
  }

  setView(page: ListManagerViews) {
    this.view = page;
    this.page$.next(this.view);
  }

  renameList(storeList: SimplifiedStoreList, newListName: string) {
    if (storeList.storeListName !== newListName) {
      this.saving = true;
      this.storeListService.getOneById(storeList.id)
        .subscribe((sl: StoreList) => {
          sl.storeListName = newListName;

          this.storeListService.update(sl)
            .pipe(finalize(() => this.saving = false))
            .subscribe(() => this.refreshStoreLists(),
              err => this.errorService.handleServerError('Failed to rename list!', err,
                () => console.log(err), () => this.renameList(storeList, newListName)));
        }, err => {
          this.saving = false;
          this.errorService.handleServerError('Failed to rename list!', err,
            () => console.log(err), () => this.renameList(storeList, newListName))
        });
    }
  }

}
