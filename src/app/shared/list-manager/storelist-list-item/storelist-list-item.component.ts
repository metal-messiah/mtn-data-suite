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
    private dialog: MatDialog
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

}
