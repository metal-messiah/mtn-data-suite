import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SimplifiedBanner } from '../../../models/simplified/simplified-banner';
import { UserProfileSelectComponent } from '../../../shared/user-profile-select/user-profile-select.component';
import { TextInputDialogComponent } from '../../../shared/text-input-dialog/text-input-dialog.component';
import { StoredControlsSelectionDialogComponent } from '../../../shared/stored-controls-selection-dialog/stored-controls-selection-dialog.component';
import { Control } from '../../../models/control';
import { DbEntityMarkerService } from '../../../core/services/db-entity-marker.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { StoreStatusOptions } from '../../../core/functionalEnums/StoreStatusOptions';
import { SelectBannerComponent } from '../../select-banner/select-banner.component';
import { MapService } from '../../../core/services/map.service';
import { BannerService } from '../../../core/services/banner.service';
import { SimpleSelectDialogComponent } from '../../../shared/simple-select-dialog/simple-select-dialog.component';
import { SimplifiedStoreList } from '../../../models/simplified/simplified-store-list';
import { StoreListService } from '../../../core/services/store-list.service';

@Component({
  selector: 'mds-db-entity-controls',
  templateUrl: './db-entity-controls.component.html',
  styleUrls: ['./db-entity-controls.component.css']
})
export class DbEntityControlsComponent implements OnInit {

  @Output() viewStoreList = new EventEmitter<SimplifiedStoreList>();

  storeListOptions: SimplifiedStoreList[] = [];

  constructor(private dbEntityMarkerService: DbEntityMarkerService,
              private mapService: MapService,
              private bannerService: BannerService,
              private storeListService: StoreListService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.setStoreListOptions();
  }

  get markerTypeOptions() {
    return this.dbEntityMarkerService.markerTypeOptions;
  }

  get zoom() {
    return this.mapService.getZoom();
  }

  get controls() {
    return this.dbEntityMarkerService.controls;
  }

  clearBanner(banner: SimplifiedBanner) {
    this.dbEntityMarkerService.removeBannerFilter(banner);
  }

  selectAssignee() {
    this.dialog.open(UserProfileSelectComponent).afterClosed()
      .subscribe(user => {
        if (user != null) {
          this.dbEntityMarkerService.controls.assignment = user;
        }
      });
  }

  clearAssignment() {
    this.dbEntityMarkerService.controls.assignment = null;
  }

  selectStoreList() {
    const config = {
      data: {
        title: 'Select a Store List',
        items: this.storeListOptions,
        getDisplayText: (storeList: SimplifiedStoreList) => storeList.storeListName
      }
    };
    this.dialog.open(SimpleSelectDialogComponent, config).afterClosed()
      .subscribe(storeList => this.dbEntityMarkerService.controls.storeList = storeList);
  }

  clearStoreList() {
    this.dbEntityMarkerService.controls.storeList = null;
  }

  saveFilter() {
    this.dialog.open(TextInputDialogComponent, {data: {title: 'Filter Name', placeholder: 'Filter Name'}}).afterClosed()
      .subscribe(async (name: string) => {
        if (name) {
          this.dbEntityMarkerService.saveControlsAs(name);
        }
      })
  }

  loadFilter() {
    this.dialog.open(StoredControlsSelectionDialogComponent).afterClosed()
      .subscribe((control: Control) => {
        if (control) {
          this.dbEntityMarkerService.setControls(control.control);
        }
      })
  }

  resetFilters() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reset All Filters',
        question: `Reset All Filters and Options to Default Values?`,
        options: ['Confirm']
      }
    });
    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'Confirm') {
        this.dbEntityMarkerService.resetControls();
      }
    });
  }

  getActiveTypeNames() {
    const {
      showActive,
      showHistorical,
      showFuture,
      showVacantSites,
      showSitesBackfilledByNonGrocery,
      showFloat
    } = this.dbEntityMarkerService.controls;

    const labels = [
      showActive ? 'Active' : '',
      showHistorical ? 'Historical' : '',
      showFuture ? 'Future' : '',
      showVacantSites ? 'Vacant Sites' : '',
      showSitesBackfilledByNonGrocery ? 'Backfilled' : '',
      showFloat ? 'Float' : ''
    ];

    return labels.filter(l => l).join(', ') || 'Exclude All Types';
  }

  getActiveStoreListFilterName() {
    const storeList = this.dbEntityMarkerService.controls.storeList;
    return storeList ? storeList.storeListName : 'All Stores';
  }

  getActiveMarkerTypeName() {
    return this.dbEntityMarkerService.controls.markerType;
  }

  getActiveControlNames() {
    const {
      updateOnBoundsChange,
      cluster,
      fullLabelMinZoomLevel
    } = this.dbEntityMarkerService.controls;

    const labels = [
      updateOnBoundsChange ? `Updating` : `NOT Updating`,
      cluster ? `Clustering` : '',
      fullLabelMinZoomLevel <= this.mapService.getZoom() ? `Labeling` : ''
    ];

    return labels.filter(l => l).join(', ');
  }

  getActiveStatusNames() {
    const {
      showClosed, showDeadDeal, showNewUnderConstruction, showOpen, showPlanned,
      showProposed, showRemodel, showRumored, showStrongRumor, showTemporarilyClosed
    } = this.dbEntityMarkerService.controls;

    const labels = [
      showClosed ? StoreStatusOptions.CLOSED : '',
      showDeadDeal ? StoreStatusOptions.DEAD_DEAL : '',
      showNewUnderConstruction ? StoreStatusOptions.NEW_UNDER_CONSTRUCTION : '',
      showOpen ? StoreStatusOptions.OPEN : '',
      showPlanned ? StoreStatusOptions.PLANNED : '',
      showProposed ? StoreStatusOptions.PROPOSED : '',
      showRemodel ? StoreStatusOptions.REMODEL : '',
      showRumored ? StoreStatusOptions.RUMORED : '',
      showStrongRumor ? StoreStatusOptions.STRONG_RUMOR : '',
      showTemporarilyClosed ? StoreStatusOptions.TEMPORARILY_CLOSED : ''
    ];

    return labels.filter(l => l).join(', ') || 'Exclude All Statuses';
  }

  getActiveBannerName() {
    const banners = this.dbEntityMarkerService.controls.banners;
    return banners && banners.length ? banners.map(b => b.bannerName).join(', ') : null;
  }

  getActiveAssignmentName() {
    const assignment = this.dbEntityMarkerService.controls.assignment;
    return assignment ? `${assignment.firstName} ${assignment.lastName}` : null;
  }

  get filterBanners(): SimplifiedBanner[] {
    return this.dbEntityMarkerService.controls.banners;
  }

  selectBanner() {
    const config = {maxWidth: '90%'};
    this.dialog.open(SelectBannerComponent, config).afterClosed().subscribe(selectedBanner => {
      if (selectedBanner && selectedBanner.bannerName) {
        this.dbEntityMarkerService.addBannerFilter(selectedBanner);
      }
    });
  }

  getBannerImageSrc(banner: SimplifiedBanner) {
    return banner ? this.bannerService.getBannerImageSrc(banner) : null;
  }

  setStoreListOptions() {
    // Get all store lists (that the user has permissions to see)
    this.storeListService.getStoreLists({}).subscribe(page => this.storeListOptions = page.content);
  }

  viewList(storeList: SimplifiedStoreList) {
    this.viewStoreList.emit(storeList);
  }
}
