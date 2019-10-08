import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { StoreService } from '../../../core/services/store.service';
import { SiteService } from '../../../core/services/site.service';
import { MapService } from '../../../core/services/map.service';
import { StoreListUIService } from '../store-list-u-i.service';
import { EntitySelectionService } from '../../../core/services/entity-selection.service';
import { finalize, tap } from 'rxjs/operators';
import { SimplifiedStore } from '../../../models/simplified/simplified-store';
import { LatLng } from '../../../models/latLng';
import { StoreListService } from '../../../core/services/store-list.service';
import { DbEntityMarkerService } from '../../../core/services/db-entity-marker.service';
import { ErrorService } from '../../../core/services/error.service';
import { SimplifiedStoreList } from '../../../models/simplified/simplified-store-list';
import { MatDialog, MatSnackBar } from '@angular/material';
import { TextInputDialogComponent } from '../../text-input-dialog/text-input-dialog.component';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { StorageService } from '../../../core/services/storage.service';
import { Subscription } from 'rxjs';
import { DownloadDialogComponent } from 'app/casing/download-dialog/download-dialog.component';

@Component({
  selector: 'mds-sidenav-stores-in-list',
  templateUrl: './sidenav-stores-in-list.component.html',
  styleUrls: ['./sidenav-stores-in-list.component.css'],
  providers: [StoreListUIService]
})
export class SidenavStoresInListComponent implements OnInit, OnDestroy {
  saving = false;

  storeList;
  private listId;

  private storeIds: Set<number>;

  routeListener: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storeService: StoreService,
    private storeListService: StoreListService,
    private siteService: SiteService,
    private mapService: MapService,
    private errorService: ErrorService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private dbEntityMarkerService: DbEntityMarkerService,
    private storeListUIService: StoreListUIService,
    private storageService: StorageService,
    private selectionService: EntitySelectionService
  ) {}

  ngOnInit() {
    this.initializeList();

    this.routeListener = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.initializeList();
      }
    });
  }

  private initializeList() {
    // Get the list Id
    this.listId = parseInt(this.route.snapshot.paramMap.get('listId'), 10);

    this.storageService.set('casing-dashboard-store-list-view', 'list-stores/' + this.listId).subscribe();

    // Get the list
    this.storeListService.getOneById(this.listId).subscribe(storeList => {
      // Store the list
      this.storeList = storeList;
      this.storeIds = new Set(this.storeList.stores.map(st => st.id));

      // Update the list UI elements
      this.updateListUIElements().subscribe(() => {
        // Subscribe to any further updates to the list
        this.storeListService.storeListUpdated$.subscribe(updatedList => {
          // Only update if updated store list is the one being displayed
          if (updatedList.id === this.listId) {
            this.storeList = updatedList;
            this.storeIds = new Set(this.storeList.stores.map(st => st.id));
            if (this.storeListIsCurrentFilter()) {
              this.dbEntityMarkerService.controls.storeList = new SimplifiedStoreList(this.storeList);
            }
            this.updateListUIElements().subscribe();
          }
        });
      });
    });
  }

  ngOnDestroy() {
    this.routeListener.unsubscribe();
  }

  private updateListUIElements() {
    return this.storeListService.getSiteMarkersForStoreList(this.listId).pipe(
      tap(siteMarkers => {
        this.storeListUIService.setSiteMarkers(siteMarkers, this.dbEntityMarkerService.controls);
      })
    );
  }

  renameList() {
    // Open dialog to get new name
    this.dialog
      .open(TextInputDialogComponent, { data: { title: 'Rename List', placeholder: this.storeList.storeListName } })
      .afterClosed()
      .subscribe((text: string) => {
        if (text) {
          if (text === this.storeList.storeListName) {
            this.snackBar.open('That is the same name. No change.', null, { duration: 2000 });
          } else {
            this.saving = true;
            this.storeListService
              .renameList(this.storeList.id, text)
              .pipe(finalize(() => (this.saving = false)))
              .subscribe(
                () => {
                  this.snackBar.open('Successfully renamed storeList', null, { duration: 2000 });
                },
                err =>
                  this.errorService.handleServerError(
                    'Failed to update storeList name!',
                    err,
                    () => console.log(err),
                    () => this.renameList()
                  )
              );
          }
        }
      });
  }

  deleteList() {
    const confirmed = 'Delete List';
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Warning!',
          question: `You are about to delete ${this.storeList.storeListName}...`,
          options: [confirmed]
        }
      })
      .afterClosed()
      .subscribe((choice: string) => {
        if (choice === confirmed) {
          this.saving = true;
          this.storeListService
            .delete(this.storeList.id)
            .pipe(finalize(() => (this.saving = false)))
            .subscribe(() => {
              this.snackBar.open('Successfully deleted storeList', null, { duration: 2000 });
              this.goBack();
            });
        }
      });
  }

  selectedStoreIdsInList() {
    if (!this.storeIds) {
      return [];
    }
    return Array.from(this.selectionService.storeIds).filter(storeId => this.storeIds.has(storeId));
  }

  selectedStoreIdsNotInList() {
    if (!this.storeIds) {
      return Array.from(this.selectionService.storeIds);
    }
    return Array.from(this.selectionService.storeIds).filter(storeId => !this.storeIds.has(storeId));
  }

  removeSelectedFromList() {
    this.saving = true;
    // Remove the stores from the list
    this.storeListService
      .removeStoresFromStoreList(this.storeList.id, this.selectedStoreIdsInList())
      .pipe(finalize(() => (this.saving = false)))
      .subscribe(() => {
        this.snackBar.open('Successfully removed stores from list', null, { duration: 2000 });
      });
  }

  addSelectedToList() {
    this.saving = true;
    // Remove the stores from the list
    this.storeListService
      .addStoresToStoreList(this.storeList.id, this.selectedStoreIdsNotInList())
      .pipe(finalize(() => (this.saving = false)))
      .subscribe(() => {
        this.snackBar.open('Successfully added stores to list', null, { duration: 2000 });
      });
  }

  zoomToList() {
    if (this.storeList.stores.length) {
      this.saving = true;
      this.storeService
        .getAllByIds(this.storeList.stores.map(st => st.id))
        .pipe(finalize(() => (this.saving = false)))
        .subscribe(
          (stores: SimplifiedStore[]) => {
            const storeGeoms = stores.map((s: SimplifiedStore) => new LatLng(s.site.latitude, s.site.longitude));
            this.mapService.fitToPoints(storeGeoms, this.storeList.storeListName);
          },
          err =>
            this.errorService.handleServerError(
              'Failed to Zoom to List!',
              err,
              () => console.log(err),
              () => this.zoomToList()
            )
        );
    }
  }

  storeListIsCurrentFilter() {
    if (this.storeList) {
      const selectedList = this.dbEntityMarkerService.controls.storeList;
      return selectedList && selectedList.id === this.storeList.id;
    } else {
      return false;
    }
  }

  setStoreListAsFilter() {
    this.dbEntityMarkerService.controls.storeList = new SimplifiedStoreList(this.storeList);
  }

  removeStoreListAsFilter() {
    this.dbEntityMarkerService.controls.storeList = null;
  }

  goBack() {
    this.router.navigate(['casing', 'my-store-lists'], { skipLocationChange: true });
  }

  getSelectedStoresCount(): number {
    return this.selectionService.storeIds.size;
  }

  enableMultiSelect() {
    this.selectionService.setMultiSelect(true);
  }

  isMultiSelecting() {
    return this.selectionService.isMultiSelecting();
  }

  clearSelection() {
    this.selectionService.clearSelection();
  }

  zoomToSelection() {
    this.saving = true;
    this.storeService.getAllByIds(Array.from(this.selectionService.storeIds)).subscribe(
      (stores: SimplifiedStore[]) => {
        const points = stores.map((s: SimplifiedStore) => new LatLng(s.site.latitude, s.site.longitude));
        this.mapService.fitToPoints(points);
      },
      err =>
        this.errorService.handleServerError(
          'Failed to get coordinates for selection!',
          err,
          () => console.log(err),
          () => this.zoomToSelection()
        )
    );
  }

  openDownloadDialog(storeList: SimplifiedStoreList) {
    const config = {
      data: { selectedStoreList: storeList },
      maxWidth: '90%'
    };
    this.dialog.open(DownloadDialogComponent, config);
  }
}
