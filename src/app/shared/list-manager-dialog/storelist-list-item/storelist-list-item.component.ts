import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SimplifiedStoreList } from 'app/models/simplified/simplified-store-list';
import { Subscription } from 'rxjs';
import { ListManagerService } from '../list-manager.service';
import { SimplifiedStore } from 'app/models/simplified/simplified-store';
import { ConfirmDialogComponent } from 'app/shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';

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

  constructor(private listManagerService: ListManagerService, 
    private dialog: MatDialog) { }

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
    this.listManagerService.setSelectedStoreList(storeList);
  }

  deleteList(storeList: SimplifiedStoreList): void {
    const confirmed = 'Delete List From Database';
    const confirmation = this.dialog.open(ConfirmDialogComponent, {
        data: {
            title: 'Warning!',
            question: 'This will delete the list and its contents from the database...',
            options: [ confirmed ]
        }
    });
    confirmation.afterClosed().subscribe((choice: string) => {
        if (choice === confirmed) {
            this.listManagerService.deleteList(storeList);
        }
    });
}
}
