import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { SimplifiedStoreList } from '../../models/simplified/simplified-store-list';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StoreListService } from 'app/core/services/store-list.service';
import { forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { AuthService } from '../../core/services/auth.service';
import { StoreListSearchType } from '../../core/functionalEnums/StoreListSearchType';
import { finalize } from 'rxjs/operators';
import { ErrorService } from '../../core/services/error.service';

export enum AddRemoveType {
  ADD,
  REMOVE
}

@Component({
  selector: 'mds-add-remove-stores-list-dialog',
  templateUrl: './add-remove-stores-list-dialog.component.html',
  styleUrls: ['./add-remove-stores-list-dialog.component.css']
})
export class AddRemoveStoresListDialogComponent implements OnInit {

  type: AddRemoveType;
  storeIds: number[];

  selectedListIds = [];
  storeLists: SimplifiedStoreList[] = [];

  fetching = false;

  @ViewChild('selectionList', {static: true}) selectionList: any = {
    selectedOptions: {selected: []}
  };

  constructor(private storeListService: StoreListService,
              private snackBar: MatSnackBar,
              private authService: AuthService,
              private errorService: ErrorService,
              private dialogRef: MatDialogRef<AddRemoveStoresListDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.type = data.type;
    this.storeIds = data.storeIds;
  }

  ngOnInit() {
    this.getLists();
  }

  private getLists() {
    this.fetching = true;
    const options = {
      searchType: StoreListSearchType.ANY
    };
    if (this.data.type === AddRemoveType.REMOVE) {
      options['includingStoreIds'] = this.storeIds;
    } else {
      options['excludingStoreIds'] = this.storeIds;
    }
    this.storeListService.getStoreLists(options)
      .pipe(finalize(() => this.fetching = false))
      .subscribe(page => this.storeLists = page.content,
        err => this.errorService.handleServerError('Failed to get store lists!', err,
          () => console.log(err), () => this.getLists()));
  }

  getStoresText() {
    return this.storeIds.length > 1 ? 'Stores' : 'Store';
  }

  getAddOrRemoveTitle() {
    const storesText = this.getStoresText();
    return this.type === AddRemoveType.ADD ?
      `Add Selected ${storesText} To Lists` :
      `Remove Selected ${storesText} From Lists`;
  }

  getSaveButtonText() {
    const targetListsCount = this.selectedListIds.length;
    const storesText = this.getStoresText();
    const listsText = targetListsCount > 1 ? 'Lists' : 'List';
    return this.type === AddRemoveType.ADD ?
      `Add Selected ${storesText} To ${targetListsCount} ${listsText}` :
      `Remove Selected ${storesText} From ${targetListsCount} ${listsText}`;
  }

  submit() {
    if (this.type === AddRemoveType.ADD) {
      const obs = this.selectedListIds.map(listId => this.storeListService.addStoresToStoreList(listId, this.storeIds));
      forkJoin(obs).subscribe(() => {
        this.snackBar.open('Successfully added stores to selected lists', null, {duration: 2000});
        this.dialogRef.close()
      });
    } else {
      const obs = this.selectedListIds.map(listId => this.storeListService.removeStoresFromStoreList(listId, this.storeIds));
      forkJoin(obs).subscribe(() => {
        this.snackBar.open('Successfully removed stores from selected lists', null, {duration: 2000});
        this.dialogRef.close()
      });
    }
  }

}
