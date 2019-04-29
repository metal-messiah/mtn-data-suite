import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { Subscription } from 'rxjs';
import { ListManagerService } from '../list-manager.service';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { ConfirmDialogComponent } from 'app/shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';
import { Pages } from '../list-manager-pages';
import { UserProfileSelectComponent } from 'app/shared/user-profile-select/user-profile-select.component';
import { UserProfile } from 'app/models/full/user-profile';
import { SimplifiedUserProfile } from 'app/models/simplified/simplified-user-profile';

@Component({
  selector: 'mds-storelist-list-item',
  templateUrl: './storelist-list-item.component.html',
  styleUrls: ['./storelist-list-item.component.css']
})
export class StorelistListItemComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  @Input() storeList: SimplifiedStoreList;
  @Input() stores: SimplifiedStore[];
  @Input() listItemId: string;

  constructor(
    private listManagerService: ListManagerService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {


  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => s.unsubscribe());
  }

  getSubscribeButtonText(storeList: SimplifiedStoreList): string {
    if (this.listManagerService.userIsSubscribedToStoreList(storeList)) {
      return 'Unsubscribe From List';
    } else {
      return 'Subscribe to List';
    }
  }

  toggleSubscribe(storeList: SimplifiedStoreList) {
    this.listManagerService.toggleSubscribe(storeList);
  }

  viewStores(storeList: SimplifiedStoreList) {
    this.listManagerService.setSelectedStoreList(storeList, Pages.VIEWSTORES);
  }

  viewSubscribers(storeList: SimplifiedStoreList) {
    this.listManagerService.setSelectedStoreList(storeList, Pages.VIEWSUBSCRIBERS);
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

  addStoresToStoreList(storeList: SimplifiedStoreList) {
    this.listManagerService.addToList(null, [storeList]);
  }

  removeStoresFromStoreList(storeList: SimplifiedStoreList) {
    this.listManagerService.removeFromList([storeList], this.stores);
  }

  share(storeList: SimplifiedStoreList) {
    const userProfileSelect = this.dialog.open(UserProfileSelectComponent)
    userProfileSelect.afterClosed().subscribe((user: UserProfile) => {
      this.listManagerService.subscribe(new SimplifiedUserProfile(user), storeList);
    })
  }

  storeListIsCurrentFilter(storeList: SimplifiedStoreList) {
    return this.listManagerService.storeListIsCurrentFilter(storeList);
  }


}
