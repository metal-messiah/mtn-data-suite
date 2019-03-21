import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { SiteInfoCardComponent } from '../site-info-card/site-info-card.component';
import { ListManagerDialogComponent } from '../list-manager-dialog/list-manager-dialog.component';

@Component({
    selector: 'mds-store-info-card',
    templateUrl: './store-info-card.component.html',
    styleUrls: [ './store-info-card.component.css' ]
})
export class StoreInfoCardComponent extends SiteInfoCardComponent implements OnInit, OnChanges {
    @Input() store: SimplifiedStore;

    ngOnInit() {}

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
        this.storeService.updateFloating(this.store.id, floating).subscribe(
            (store: SimplifiedStore) => {
                this.store = store;
                this.onUpdate.emit(new SimplifiedStore(store));
                this.snackBar.open(`Updated Store`, null, { duration: 2000 });
            },
            (err) =>
                this.errorService.handleServerError(
                    'Failed to update store',
                    err,
                    () => console.log(err),
                    () => this.setFloating(floating)
                )
        );
    }

    copyToClipboard(val) {
        console.log('copying');
        const selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = val;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
        this.snackBar.open(`${val} copied to clipboard`, null, { duration: 1000 });
    }

    validateStore() {
        this.storeService.validateStore(this.store.id).subscribe(
            (store: SimplifiedStore) => {
                this.store = store;
                this.onUpdate.emit(new SimplifiedStore(store));
                this.snackBar.open(`Validated Store`, null, { duration: 2000 });
            },
            (err) =>
                this.errorService.handleServerError(
                    'Failed to validate store',
                    err,
                    () => console.log('cancelled'),
                    () => this.validateStore()
                )
        );
    }

    invalidateStore() {
        this.storeService.invalidateStore(this.store.id).subscribe(
            (store: SimplifiedStore) => {
                this.store = store;
                this.onUpdate.emit(new SimplifiedStore(store));
                this.snackBar.open(`Invalidated Store`, null, { duration: 2000 });
            },
            (err) =>
                this.errorService.handleServerError(
                    'Failed to invalidate store',
                    err,
                    () => console.log('cancelled'),
                    () => this.validateStore()
                )
        );
    }
    openListManagerDialog() {
        const listManagerDialogComponent = this.dialog.open(ListManagerDialogComponent, {
            data: { stores: [ this.store ] }
        });
        listManagerDialogComponent.afterClosed().subscribe((e) => {
            console.log(e);
        });
    }
}
