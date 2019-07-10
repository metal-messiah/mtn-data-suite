import { SimplifiedStore } from './simplified/simplified-store';
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { LatLng } from './latLng';
import { EntityMappable } from '../interfaces/entity-mappable';
import { MapService } from '../core/services/map.service';
import { StoreIconProvider } from '../utils/StoreIconProvider';
import MarkerLabel = google.maps.MarkerLabel;

export class StoreMappable implements EntityMappable {

  private store: SimplifiedStore;
  private draggable = false;

  private readonly sessionUserId: number;
  private readonly isSelected: (Entity) => boolean;
  private readonly getSelectedProjectId: () => number;
  private readonly mapService: MapService;

  private storeIconProvider: StoreIconProvider;

  constructor(store: SimplifiedStore, currentUserId: number,
              mapService: MapService,
              isSelected: (Entity) => boolean,
              getSelectedProjectId?: () => number,
              storeIconProvider?: StoreIconProvider) {
    this.store = store;
    this.sessionUserId = currentUserId;
    this.isSelected = isSelected;
    this.getSelectedProjectId = getSelectedProjectId;
    this.mapService = mapService;
    this.storeIconProvider = storeIconProvider ? storeIconProvider : new StoreIconProvider(mapService);
  }

  setStoreIconProvider(storeIconProvider: StoreIconProvider) {
    this.storeIconProvider = storeIconProvider;
  }

  getCoordinates(): LatLng {
    return {lat: this.store.site.latitude, lng: this.store.site.longitude};
  };

  isDraggable(): boolean {
    return this.draggable;
  }

  getLabel(markerType?: MarkerType): string | MarkerLabel {
    return this.storeIconProvider.getLabel(this.store);
  }

  getIcon(): string | google.maps.Icon | google.maps.Symbol {
    const assignee = this.store.site.assignee;
    const assigned = assignee != null;
    const assignedToSelf = assigned && assignee.id === this.sessionUserId;
    return this.storeIconProvider.getIcon(this.store, this.draggable, this.isSelected(this.getEntity()), assigned, assignedToSelf);
  }

  updateEntity(store: SimplifiedStore) {
    this.store = store;
  }

  getEntity(): SimplifiedStore {
    return this.store;
  }

  setMoving(moving: boolean) {
    this.draggable = moving;
  }

}
