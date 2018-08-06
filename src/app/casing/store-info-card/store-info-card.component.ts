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

  @Input() store: SimplifiedStore;

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
    this.storeService.updateFloating(this.store.id, floating)
      .subscribe((store: SimplifiedStore) => {
        this.store = store;
        this.onUpdate.emit(new SimplifiedStore(store));
        this.snackBar.open(`Updated Store`, null, {duration: 2000});
      }, err => this.errorService.handleServerError('Failed to update store', err,
        () => console.log(err),
        () => this.setFloating(floating)));
  }
}
