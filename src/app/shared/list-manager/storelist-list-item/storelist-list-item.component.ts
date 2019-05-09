import { Component, Input } from '@angular/core';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { ListManagerService } from '../list-manager.service';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { ConfirmDialogComponent } from 'app/shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';
import { Pages } from '../list-manager-pages';
import { UserProfileSelectComponent } from 'app/shared/user-profile-select/user-profile-select.component';
import { UserProfile } from 'app/models/full/user-profile';
import { SimplifiedUserProfile } from 'app/models/simplified/simplified-user-profile';
import { TextInputDialogComponent } from 'app/shared/text-input-dialog/text-input-dialog.component';
import { DbEntityMarkerService } from 'app/core/services/db-entity-marker.service';
import { StoreService } from 'app/core/services/store.service';
import { MapService } from 'app/core/services/map.service';
import * as MarkerWithLabel from '@google/markerwithlabel';
import { ErrorService } from 'app/core/services/error.service';

@Component({
  selector: 'mds-storelist-list-item',
  templateUrl: './storelist-list-item.component.html',
  styleUrls: ['./storelist-list-item.component.css']
})
export class StorelistListItemComponent {

  @Input() storeList: SimplifiedStoreList;
  @Input() stores: SimplifiedStore[];
  @Input() listItemId: string;

  constructor(
    private listManagerService: ListManagerService,
    private storeService: StoreService,
    private dbEntityMarkerService: DbEntityMarkerService,
    private mapService: MapService,
    private dialog: MatDialog,
    private errorService: ErrorService
  ) {
  }

  // TODO Implement list subscription
  // getSubscribeButtonText(storeList: SimplifiedStoreList): string {
  //   if (this.listManagerService.userIsSubscribedToStoreList(storeList)) {
  //     return 'Unsubscribe From List';
  //   } else {
  //     return 'Subscribe to List';
  //   }
  // }
  //
  // toggleSubscribe(storeList: SimplifiedStoreList) {
  //   this.listManagerService.toggleSubscribe(storeList);
  // }
  //
  // viewSubscribers(storeList: SimplifiedStoreList) {
  //   this.listManagerService.setSelectedStoreList(storeList, Pages.VIEWSUBSCRIBERS);
  // }

  viewStores(storeList: SimplifiedStoreList) {
    this.listManagerService.setSelectedStoreList(storeList, Pages.VIEWSTORES);
  }

  deleteList(storeList: SimplifiedStoreList): void {
    const confirmed = 'Delete List';
    const confirmation = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Warning!',
        question:
          `You are about to delete ${storeList.storeListName}...`,
        options: [confirmed]
      }
    });
    confirmation.afterClosed().subscribe((choice: string) => {
      if (choice === confirmed) {
        this.listManagerService.deleteList(storeList);
      }
    });
  }

  share(storeList: SimplifiedStoreList) {
    this.dialog.open(UserProfileSelectComponent).afterClosed()
      .subscribe((user: UserProfile) => this.listManagerService.subscribe(new SimplifiedUserProfile(user), storeList))
  }

  storeListIsCurrentFilter(storeList: SimplifiedStoreList) {
    return this.listManagerService.storeListIsCurrentFilter(storeList);
  }

  renameList(storeList: SimplifiedStoreList) {
    const textInputDialog = this.dialog.open(TextInputDialogComponent, { data: { title: 'Rename List', placeholder: 'New List Name' } });
    textInputDialog.afterClosed().subscribe((text: string) => {
      if (text) {
        // save new name
        this.listManagerService.renameList(storeList, text);
      }
    })
  }

  filterMap(storeList: SimplifiedStoreList) {
    if (!this.storeListIsCurrentFilter(storeList)) {
      this.listManagerService.setStoreListAsCurrentFilter(storeList);
    }
  }

  clearMapFilter() {
    this.listManagerService.setStoreListAsCurrentFilter(null);
  }

  zoomToList(storeList: SimplifiedStoreList) {
    if (storeList.storeIds.length) {
      this.dbEntityMarkerService.showMapSpinner(true);
      this.storeService.getAllByIds(storeList.storeIds).subscribe((stores: SimplifiedStore[]) => {
        const storeGeoms = stores.map((s: SimplifiedStore) => {
          return { lat: s.site.latitude, lng: s.site.longitude }
        });
        const bounds = this.mapService.getBoundsOfPoints(storeGeoms);
        const map = this.mapService.getMap();
        map.fitBounds(bounds);
        this.dbEntityMarkerService.showMapSpinner(false);

        const rectangle = new google.maps.Rectangle({
          strokeColor: 'orange',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: null,
          fillOpacity: 0.35,
          map,
          bounds
        });

        const getLabelStyle = (opacity) => {
          return `color: orange; font-size: 18px; font-weight: bold; text-align: center; width: 100%; opacity: ${opacity}`;
        }

        const labelStyle = getLabelStyle(1);
        const labelMarker = new MarkerWithLabel({
          position: { lat: bounds.getSouthWest().lat(), lng: bounds.getCenter().lng() },
          icon: { url: 'https://maps.gstatic.com/mapfiles/transparent.png' },
          labelContent: `<div style="${labelStyle}">${storeList.storeListName.toUpperCase()}</div>`,
          labelAnchor: new google.maps.Point(15, 0),
          labelClass: '',
          labelInBackground: false
        })

        labelMarker.setMap(map);

        const fade = (rect: google.maps.Rectangle, labelMarker: MarkerWithLabel, fillOpacity: number) => {
          const strokeOpacity = (fillOpacity + 0.45) / 2;
          const lblStyle = getLabelStyle(strokeOpacity * 2);
          const labelContent = `<div style="${lblStyle}">${storeList.storeListName.toUpperCase()}</div>`;
          labelMarker.setOptions({ labelContent })
          rect.setOptions({ fillOpacity, strokeOpacity });
          const newOpacity = fillOpacity - 0.01;
          if (newOpacity >= 0) {
            setTimeout(() => fade(rect, labelMarker, newOpacity), 250);
          } else {
            rect.setMap(null);
            labelMarker.setMap(null);
          }
        }

        fade(rectangle, labelMarker, 0.30);

      }, err => {
        this.errorService.handleServerError('Failed to Zoom to List!', err,
          () => { },
          () => this.zoomToList(storeList));
        this.dbEntityMarkerService.showMapSpinner(false);
      });
    }

  }

}
