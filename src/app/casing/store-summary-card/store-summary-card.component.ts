import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '../../models/store';
import { StoreService } from '../../core/services/store.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { ErrorService } from '../../core/services/error.service';

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
              private errorService: ErrorService
  ) { }

  ngOnInit() {
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

}
