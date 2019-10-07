import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { SimplifiedStoreList } from '../../models/simplified/simplified-store-list';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { StoreListService } from 'app/core/services/store-list.service';
import { forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { AuthService } from '../../core/services/auth.service';
import { StoreListSearchType } from '../../core/functionalEnums/StoreListSearchType';
import { finalize } from 'rxjs/operators';
import { ErrorService } from '../../core/services/error.service';
import { TextInputDialogComponent } from '../text-input-dialog/text-input-dialog.component';
import { StoreList } from '../../models/full/store-list';

export enum AddRemoveType {
  ADD = 'Add',
  REMOVE = 'Remove'
}

@Component({
  selector: 'mds-add-remove-stores-list-dialog',
  templateUrl: './add-remove-stores-list-dialog.component.html',
  styleUrls: ['./add-remove-stores-list-dialog.component.css']
})
export class AddRemoveStoresListDialogComponent implements OnInit {

  AddRemoveType = AddRemoveType;
  type: AddRemoveType;
  storeIds: number[];

  selectedListIds = [];
  storeLists: SimplifiedStoreList[] = [];

  fetching = false;
  saving = false;

  @ViewChild('selectionList', {static: true}) selectionList: any = {
    selectedOptions: {selected: []}
  };

  constructor(private storeListService: StoreListService,
              private snackBar: MatSnackBar,
              private authService: AuthService,
              private errorService: ErrorService,
              private dialog: MatDialog,
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
      .subscribe(page => {
          this.storeLists = page.content;
          if (this.storeLists.length === 0) {
            if (this.type === AddRemoveType.ADD) {
              this.snackBar.open('Store already belongs to every list!', null, {duration: 2000});
            } else {
              this.snackBar.open('Store isn\'t in any list!', null, {duration: 2000});
            }
            this.dialogRef.close();
          }
        },
        err => this.errorService.handleServerError('Failed to get store lists!', err,
          () => console.log(err), () => this.getLists()));
  }

  createNewList() {
    this.dialog.open(TextInputDialogComponent, {data: {title: 'New List', placeholder: 'New List Name'}})
      .afterClosed()
      .subscribe((text: string) => {
        if (text) {
          const newStoreList = new StoreList({storeListName: text});
          this.saveNewList(newStoreList);
        }
      });
  }

  private saveNewList(newStoreList: StoreList) {
    this.saving = false;
    this.storeListService.create(newStoreList)
      .pipe(finalize(() => this.saving = false))
      .subscribe((storeList: StoreList) => {
        this.snackBar.open('Successfully created new list', null, {duration: 2000});
        this.storeLists.push(new SimplifiedStoreList(storeList));
        this.storeLists.sort((a, b) => a.storeListName.localeCompare(b.storeListName));
      }, err => this.errorService.handleServerError('Failed to create new list!', err,
        () => console.log(err),
        () => this.saveNewList(newStoreList)));
  }

  submit() {
    if (this.type === AddRemoveType.ADD) {
      const obs = this.selectedListIds.map(listId => this.storeListService.addStoresToStoreList(listId, this.storeIds));
      forkJoin(obs).subscribe(() => {
        this.snackBar.open('Successfully added stores to selected lists', null, {duration: 2000});
        this.dialogRef.close();
      });
    } else {
      const obs = this.selectedListIds.map(listId => this.storeListService.removeStoresFromStoreList(listId, this.storeIds));
      forkJoin(obs).subscribe(() => {
        this.snackBar.open('Successfully removed stores from selected lists', null, {duration: 2000});
        this.dialogRef.close();
      });
    }
  }

}
