import { Component, OnDestroy, ViewChild } from '@angular/core';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { ListManagerService } from './list-manager.service';
import { Pages } from './list-manager-pages';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoreSidenavService } from '../store-sidenav/store-sidenav.service';

@Component({
  selector: 'mds-list-manager',
  templateUrl: './list-manager.component.html',
  styleUrls: ['./list-manager.component.css'],
  providers: []
})
export class ListManagerComponent implements OnDestroy {

  stores: SimplifiedStore[] = []; // list of stores (single/multiselect usually from casing app)

  allStoreLists: SimplifiedStoreList[] = [];
  includedStoreLists: SimplifiedStoreList[] = [];
  excludedStoreLists: SimplifiedStoreList[] = [];

  selectedStoreList: SimplifiedStoreList;

  subscriptions: Subscription[] = [];

  pages = Pages;
  page: Pages;

  @ViewChild('selectionList', { static: false }) selectionList: any;

  constructor(private listManagerService: ListManagerService,
              private snackBar: MatSnackBar,
              private storeSidenavService: StoreSidenavService) {
    this.listManagerService.setStores([]);
    this.createSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => s.unsubscribe());
  }

  get fetching() {
    return this.listManagerService.fetching;
  }

  createSubscriptions() {
    this.subscriptions.push(
      this.listManagerService.allStoreListsChanged$.subscribe((allStoreLists: SimplifiedStoreList[]) => {
        this.allStoreLists = allStoreLists;
      })
    );

    this.subscriptions.push(
      this.listManagerService.includedStoreListsChanged$.subscribe(
        (includedStoreLists: SimplifiedStoreList[]) => this.includedStoreLists = includedStoreLists)
    );

    this.subscriptions.push(
      this.listManagerService.excludedStoreListsChanged$.subscribe(
        (excludedStoreLists: SimplifiedStoreList[]) => this.excludedStoreLists = excludedStoreLists)
    );

    this.subscriptions.push(
      this.listManagerService.selectedStoreListChanged$.subscribe(
        (selectedStoreList: SimplifiedStoreList) => this.selectedStoreList = selectedStoreList)
    );

    this.subscriptions.push(
      this.listManagerService.storesChanged$.subscribe((stores: SimplifiedStore[]) => this.stores = stores)
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
      elem.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  }

  getStoreTitle(): string {
    if (this.stores.length === 1) {
      return `Store #${this.stores[0].id}`;
    } else {
      return `These ${this.stores.length.toLocaleString()} Selected Stores`;
    }
  }

  createNewList(listNameInput) {
    const listName = listNameInput.value;
    this.listManagerService.createNewList(listName);
    listNameInput.value = '';
  }

  shouldDisableNewListButton(newListName: string) {
    return this.allStoreLists.filter(
      (sl: SimplifiedStoreList) => sl.storeListName.toLowerCase() === newListName.toLowerCase()
    ).length > 0;
  }

  getNewListNamePlaceholder(newListName: string) {
    if (this.shouldDisableNewListButton(newListName)) {
      return 'List Name Already Exists!'
    }
    return 'New List Name'
  }

  getNewListNamePlaceholderColor(newListName: string) {
    return this.shouldDisableNewListButton(newListName);
  }

  addToList() {
    this.listManagerService.addToList(this.selectionList.selectedOptions.selected);
  }

  setPage(page: Pages) {
    this.listManagerService.setView(page);
  }

  clearStores() {
    this.listManagerService.setStores([]);
  }

  closeListManager() {
    this.storeSidenavService.setView(null);
  }
}
