import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '../../models/store';
import { StoreService } from '../../core/services/store.service';
import { MatDialog, MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { ErrorService } from '../../core/services/error.service';
import { SimplifiedUserProfile } from '../../models/simplified-user-profile';
import { UserProfileSelectComponent } from '../../shared/user-profile-select/user-profile-select.component';
import { StoreStatusSelectComponent } from '../store-status-select/store-status-select.component';

@Component({
  selector: 'mds-store-summary-card',
  templateUrl: './store-summary-card.component.html',
  styleUrls: ['./store-summary-card.component.css']
})
export class StoreSummaryCardComponent implements OnInit {

  @Input() store: Store;
  @Output() onStoreUpdated = new EventEmitter<Store>();

  constructor(private storeService: StoreService,
              private snackBar: MatSnackBar,
              private errorService: ErrorService,
              private dialog: MatDialog
  ) { }

  ngOnInit() {
    console.log(this.store);
  }

  updateStoreType(storeType: string) {
    const prevStoreType = this.store.storeType;
    this.store.storeType = storeType;
    this.storeService.update(this.store).subscribe((store: Store) => {
      this.onStoreUpdated.emit(store);
      this.openSnackBar('Updated Store Type', null, 2000);
    }, err => {
      this.store.storeType = prevStoreType;
      this.errorService.handleServerError('Failed to update store type', err,
        () => {},
        () => this.updateStoreType(storeType));
    });
  }

  openSnackBar(message: string, action: string, duration: number) {
    const config: MatSnackBarConfig = {
      verticalPosition: 'bottom'
    };
    if (duration != null) {
      config['duration'] = duration;
    }
    return this.snackBar.open(message, action, config);
  }

  openStoreStatusDialog() {
    const storeStatusDialog = this.dialog.open(StoreStatusSelectComponent, {data: {store: this.store}});
    storeStatusDialog.afterClosed().subscribe((store: Store) => {
      this.store = store;
    });
  }

}
