import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SimplifiedStoreList } from '../../../models/simplified/simplified-store-list';
import { StoreListService } from '../../../core/services/store-list.service';
import { DbEntityMarkerService } from '../../../core/services/db-entity-marker.service';
import { StoreService } from '../../../core/services/store.service';
import { MapService } from '../../../core/services/map.service';
import { ErrorService } from '../../../core/services/error.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { finalize } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { TextInputDialogComponent } from '../../text-input-dialog/text-input-dialog.component';
import { StoreList } from '../../../models/full/store-list';
import { SimplifiedStore } from '../../../models/simplified/simplified-store';
import { LatLng } from '../../../models/latLng';
import { StorageService } from '../../../core/services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mds-sidenav-user-lists',
  templateUrl: './sidenav-user-lists.component.html',
  styleUrls: ['./sidenav-user-lists.component.css']
})
export class SidenavUserListsComponent implements OnInit, OnDestroy {

  storeLists: SimplifiedStoreList[];

  fetching = false;
  saving = false;

  listChangeListener: Subscription;

  constructor(private router: Router,
              private storeListService: StoreListService,
              private dbEntityMarkerService: DbEntityMarkerService,
              private storeService: StoreService,
              private mapService: MapService,
              private errorService: ErrorService,
              private snackBar: MatSnackBar,
              private storageService: StorageService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.storageService.set('casing-dashboard-store-list-view', 'my-store-lists').subscribe();
    this.getUserStoreLists();
    this.listChangeListener = this.storeListService.storeListUpdated$.subscribe(() => this.getUserStoreLists());
  }

  ngOnDestroy() {
    this.listChangeListener.unsubscribe();
  }

  goBack() {
    this.router.navigate(['casing'], {skipLocationChange: true});
  }

  private getUserStoreLists() {
    // Get all store lists user has access to see
    this.fetching = true;
    this.storeListService.getStoreLists({})
      .pipe(finalize(() => this.fetching = false))
      .subscribe(page => this.storeLists = page.content.sort(((a, b) => a.storeListName.localeCompare(b.storeListName))));
  }

  goToStoreList(storeList: SimplifiedStoreList) {
    this.router.navigate(['casing', 'list-stores', storeList.id], {skipLocationChange: true});
  }

  deleteList(storeList: SimplifiedStoreList): void {
    const confirmed = 'Delete List';
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Warning!',
        question: `You are about to delete ${storeList.storeListName}...`,
        options: [confirmed]
      }
    }).afterClosed().subscribe((choice: string) => {
      if (choice === confirmed) {
        this.saving = true;
        this.storeListService.delete(storeList.id)
          .pipe(finalize(() => this.saving = false))
          .subscribe(() => {
            this.snackBar.open('Successfully deleted storeList', null, {duration: 2000});
            this.getUserStoreLists()
          })
      }
    });
  }

  storeListIsCurrentFilter(storeList: SimplifiedStoreList) {
    const selectedList = this.dbEntityMarkerService.controls.storeList;
    return selectedList && selectedList.id === storeList.id;
  }

  createNewList() {
    this.dialog.open(TextInputDialogComponent, {data: {title: 'New List', placeholder: 'New List Name'}})
      .afterClosed().subscribe((text: string) => {
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
      .subscribe(() => {
        this.snackBar.open('Successfully created new list', null, {duration: 2000});
        this.getUserStoreLists();
      }, err => this.errorService.handleServerError('Failed to create new list!', err,
        () => console.log(err),
        () => this.saveNewList(newStoreList)))
  }

  renameList(storeList: SimplifiedStoreList) {
    // Open dialog to get new name
    this.dialog.open(TextInputDialogComponent, {data: {title: 'Rename List', placeholder: storeList.storeListName}})
      .afterClosed().subscribe((text: string) => {
      if (text) {
        if (text === storeList.storeListName) {
          this.snackBar.open('That is the same name. No change.', null, {duration: 2000});
        } else {
          this.saving = true;
          this.storeListService.renameList(storeList.id, text)
            .pipe(finalize(() => this.saving = false))
            .subscribe(() => {
              this.getUserStoreLists();
              this.snackBar.open('Successfully renamed storeList', null, {duration: 2000});
            }, err => this.errorService.handleServerError('Failed to update storeList name!', err,
              () => console.log(err), () => this.renameList(storeList)));
        }
      }
    });
  }

  setStoreListAsFilter(storeList: SimplifiedStoreList) {
    this.dbEntityMarkerService.controls.storeList = storeList;
  }

  zoomToList(storeList: SimplifiedStoreList) {
    if (storeList.storeIds.length) {
      this.dbEntityMarkerService.gettingLocations = true;
      this.storeService.getAllByIds(storeList.storeIds)
        .pipe(finalize(() => this.dbEntityMarkerService.gettingLocations = false))
        .subscribe((stores: SimplifiedStore[]) => {
            const storeGeoms = stores.map((s: SimplifiedStore) => new LatLng(s.site.latitude, s.site.longitude));
            this.mapService.fitToPoints(storeGeoms, storeList.storeListName);
          }, err => this.errorService.handleServerError('Failed to Zoom to List!', err,
          () => console.log(err),
          () => this.zoomToList(storeList))
        );
    }
  }

}
