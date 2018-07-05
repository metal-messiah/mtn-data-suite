import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Store } from '../../models/full/store';
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { SiteInfoCardComponent } from '../site-info-card/site-info-card.component';

@Component({
  selector: 'mds-store-info-card',
  templateUrl: './store-info-card.component.html',
  styleUrls: ['./store-info-card.component.css']
})
export class StoreInfoCardComponent extends SiteInfoCardComponent implements OnInit, OnChanges {

  @Input() store: SimplifiedStore | Store;

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.site = this.store.site;
  }

  emitChanges() {
    this.store.site = this.site;
    this.onUpdate.emit(this.store);
  }

  moveStore() {
    this.initiateMove.next(this.store);
  }

  setFloating(floating: boolean) {
    this.storeService.getOneById(this.store.id)
      .subscribe((store: Store) => {
        store.floating = floating;
        this.updateStore(store);
      }, err => this.errorService.handleServerError('Failed to find store', err,
        () => {
        },
        () => this.setFloating(floating)));
  }

  private updateStore(storeWithUpdates: Store) {
    this.storeService.update(storeWithUpdates)
      .subscribe((updatedStore: Store) => {
          this.store = updatedStore;
          this.onUpdate.emit(new SimplifiedStore(updatedStore));
          this.snackBar.open(`Updated Store`, null, {duration: 2000});
        }, err =>
          this.errorService.handleServerError('Failed to update store', err,
            () => {
            },
            () => this.updateStore(storeWithUpdates))
      );
  }

}
