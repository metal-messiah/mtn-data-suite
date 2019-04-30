import { Component, OnInit, Input, OnChanges, Inject, ViewChild } from '@angular/core';
import { ListManagerService } from '../list-manager/list-manager.service';
import { SimplifiedStoreList } from '../../models/simplified/simplified-store-list';
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { StoreService } from '../../core/services/store.service';

import * as _ from 'lodash';
import { MatDialogRef, MatDialog, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { StoreListService } from 'app/core/services/store-list.service';
import { StoreList } from 'app/models/full/store-list';

export enum AddRemoveType {
  ADD,
  REMOVE
}

@Component({
  selector: 'mds-add-remove-stores-list-dialog',
  templateUrl: './add-remove-stores-list-dialog.component.html',
  styleUrls: ['./add-remove-stores-list-dialog.component.css']
})
export class AddRemoveStoresListDialogComponent {

  type: AddRemoveType;
  storeIds: number[];
  visible = false;

  stores: SimplifiedStore[] = [];

  allStoreLists: SimplifiedStoreList[] = [];
  includedStoreLists: SimplifiedStoreList[] = [];
  excludedStoreLists: SimplifiedStoreList[] = [];

  selectedLists: SimplifiedStoreList[] = [];

  fetching = true;

  @ViewChild('selectionList') selectionList: any = {
    selectedOptions: { selected: [] }
  };


  constructor(private listManagerService: ListManagerService, private storeService: StoreService, private storeListService: StoreListService,
    public dialogRef: MatDialogRef<AddRemoveStoresListDialogComponent>,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.type = data.type;
    this.storeIds = data.storeIds;

    this.storeService.getAllByIds(this.storeIds).subscribe((stores: SimplifiedStore[]) => {
      this.stores = stores;

      this.listManagerService.getStoreLists().subscribe((storeLists: SimplifiedStoreList[]) => {
        this.filterLists(storeLists);
      })
    });



    dialogRef.disableClose = true;
  }

  getStoresText() {
    return this.storeIds.length > 1 ? 'Stores' : 'Store';
  }

  getListsText(targetListsCount) {
    return targetListsCount > 1 ? 'Lists' : 'List'
  }

  getAddOrRemoveTitle() {
    const storesText = this.getStoresText();
    return this.type === AddRemoveType.ADD ?
      `Add Selected ${storesText} To Lists` :
      `Remove Selected ${storesText} From Lists`;
  }

  getSaveButtonText() {
    const targetListsCount = this.selectionList.selectedOptions.selected.length;
    const storesText = this.getStoresText();
    const listsText = this.getListsText(targetListsCount);
    return this.type === AddRemoveType.ADD ?
      `Add Selected ${storesText} To ${targetListsCount} ${listsText}` :
      `Remove Selected ${storesText} From ${targetListsCount} ${listsText}`;
  }

  createNewList(listNameInput) {
    const listName = listNameInput.value;
    // this.listManagerService.createNewList(listName);

    if (listName) {

      this.fetching = true;
      const newStoreList: StoreList = new StoreList({ storeListName: listName });
      this.storeListService.create(newStoreList).subscribe(() => {
        this.listManagerService.getStoreLists().subscribe((storeLists: SimplifiedStoreList[]) => {
          this.filterLists(storeLists);
        });
      })
    }
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

  sortStoreListsAlphabetically() {
    const targets = [this.allStoreLists, this.includedStoreLists, this.excludedStoreLists];
    targets.forEach((storeList: SimplifiedStoreList[]) => {
      storeList.sort((a: SimplifiedStoreList, b: SimplifiedStoreList) => {
        const text1 = a.storeListName.toUpperCase();
        const text2 = b.storeListName.toUpperCase();
        return text1 < text2 ? -1 : text1 > text2 ? 1 : 0;
      });
    });

    this.fetching = false;
  }

  modifyList() {
    if (this.type === AddRemoveType.ADD) {
      this.listManagerService.addToList(this.selectionList.selectedOptions.selected, null, this.stores);
    } else {
      this.listManagerService.removeFromList(this.selectionList.selectedOptions.selected.map(sel => sel.value), this.stores);
    }
  }

}
