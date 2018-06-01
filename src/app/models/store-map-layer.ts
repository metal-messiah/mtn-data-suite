import { MapPointLayer } from './map-point-layer';
import { StoreMappable } from './store-mappable';
import { SimplifiedStore } from './simplified-store';
import { Store } from './store';
import { Subject } from 'rxjs/Subject';
import { UserProfile } from './user-profile';
import { Coordinates } from './coordinates';
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { StoreSelectionMode } from '../casing/enums/store-selection-mode';

export class StoreMapLayer extends MapPointLayer<StoreMappable> {

  storeSelection$ = new Subject<Store | SimplifiedStore>();

  selectionMode: StoreSelectionMode = StoreSelectionMode.SINGLE_SELECT;
  markerType: MarkerType = MarkerType.PIN;

  private selectedStores: (Store | SimplifiedStore)[];

  private storeMappables: StoreMappable[];

  private selectedStoreIds: Set<number>;

  private readonly currentUser: UserProfile;

  private movingStoreMappable: StoreMappable;

  private latestSelectedStoreMappable: StoreMappable;

  constructor(currentUser: UserProfile) {
    super();
    this.currentUser = currentUser;
    this.storeMappables = [];
    this.selectedStoreIds = new Set<number>();
    this.selectedStores = [];
    this.initStoreSelection();
  }

  private initStoreSelection() {
    this.markerClick$.subscribe((clickedStoreMappable: StoreMappable) => {

      if (this.selectionMode === StoreSelectionMode.SINGLE_SELECT) {
        this.clearSelection();
        this.selectStoreMappable(clickedStoreMappable);
      } else if (this.selectionMode === StoreSelectionMode.MULTI_SELECT) {
        this.selectStoreMappable(clickedStoreMappable);
      } else if (this.selectionMode === StoreSelectionMode.MULTI_DESELECT) {
        this.deselectStoreMappable(clickedStoreMappable);
      }

      this.storeSelection$.next(clickedStoreMappable.getStore());
    });
  }

  setStores(stores: (Store | SimplifiedStore)[]) {
    this.storeMappables = stores.map(store => {
      if (this.storeMappables.length > 0) {
        const mappable = this.storeMappables.find((m: StoreMappable) => m.id === store.id);
        if (mappable != null) {
          mappable.updateStore(store);
          return mappable;
        }
      }
      const newMappable = new StoreMappable(store, this.currentUser);
      newMappable.setSelected(this.selectedStoreIds.has(store.id));
      return newMappable;
    });
    this.clearMarkers();
    this.createMarkersFromMappables(this.storeMappables);
  }

  setMarkerType(markerType: MarkerType) {
    this.markerType = markerType;
  }

  selectStoresInShape(shape) {
    const storeMappables = this.getMappablesInShape(shape);
    storeMappables.forEach((mappable: StoreMappable) => this.selectStoreMappable(mappable));
    this.refreshOptions();
  }

  deselectStoresInShape(shape) {
    const storeMappables = this.getMappablesInShape(shape);
    storeMappables.forEach((mappable: StoreMappable) => this.deselectStoreMappable(mappable));
    this.refreshOptions();
  }

  clearSelection() {
    this.latestSelectedStoreMappable = null;
    this.selectedStoreIds.clear();
    this.selectedStores = [];
    this.storeMappables.forEach((storeMappable: StoreMappable) => {
      storeMappable.setSelected(false);
      this.refreshOptionsForMappable(storeMappable);
    });
  }

  startMovingStore(store: Store | SimplifiedStore) {
    const storeMappable = this.storeMappables.find((marker: StoreMappable) => marker.id === store.id);
    this.movingStoreMappable = storeMappable;
    storeMappable.setMoving(true);
    this.refreshOptionsForMappable(storeMappable);
  }

  cancelMovingStore() {
    this.movingStoreMappable.setMoving(false);
    this.resetPositionOfMappable(this.movingStoreMappable);
    this.refreshOptionsForMappable(this.movingStoreMappable);
    this.movingStoreMappable = null;
  }

  getMovedStoreCoordinates(): Coordinates {
    return this.getCoordinatesOfMappableMarker(this.movingStoreMappable);
  }

  getMovedStore() {
    return this.movingStoreMappable.getStore();
  }

  selectStore(store: Store | SimplifiedStore) {
    const storeMappable = this.storeMappables.find((marker: StoreMappable) => marker.id === store.id);
    this.selectStoreMappable(storeMappable);
    this.refreshOptionsForMappable(storeMappable);
  }

  deselectStore(store: Store | SimplifiedStore) {
    const storeMappable = this.storeMappables.find((marker: StoreMappable) => marker.id === store.id);
    if (storeMappable) {
      this.deselectStoreMappable(storeMappable);
      this.refreshOptionsForMappable(storeMappable);
    } else {
      // Store is no longer on the screen - mappable was deleted
    }
  }

  updateStore(store: Store | SimplifiedStore) {
    const storeMappable = this.storeMappables.find((marker: StoreMappable) => marker.id === store.id);
    storeMappable.updateStore(store);
    this.refreshOptionsForMappable(storeMappable);
  }

  getSelectedStores() {
    return this.selectedStores;
  }

  private selectStoreMappable(storeMappable: StoreMappable): void {
    storeMappable.setSelected(true);
    this.refreshOptionsForMappable(storeMappable);
    if (!this.selectedStoreIds.has(storeMappable.id)) {
      this.selectedStoreIds.add(storeMappable.id);
      this.selectedStores.push(storeMappable.getStore());
    }
  }

  private deselectStoreMappable(storeMappable: StoreMappable) {
    storeMappable.setSelected(false);
    this.refreshOptionsForMappable(storeMappable);
    if (this.selectedStoreIds.has(storeMappable.id)) {
      this.selectedStoreIds.delete(storeMappable.id);
      const index = this.selectedStores.findIndex((s: Store|SimplifiedStore) => {
        return s.id === storeMappable.getStore().id;
      });
      this.selectedStores.splice(index, 1);
    }
  }
}
