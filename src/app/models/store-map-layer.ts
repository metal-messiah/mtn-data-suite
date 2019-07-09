import { EntityMapLayer } from './entity-map-layer';
import { StoreMappable } from './store-mappable';
import { SimplifiedStore } from './simplified/simplified-store';
import { AuthService } from '../core/services/auth.service';
import { MapService } from '../core/services/map.service';
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { StoreIconProvider } from '../utils/StoreIconProvider';

export class StoreMapLayer extends EntityMapLayer<StoreMappable> {

  private readonly authService: AuthService;
  private readonly getSelectedProjectId: () => number;
  private iconProvider: StoreIconProvider;

  markerType: MarkerType = MarkerType.PIN;

  constructor(mapService: MapService,
              authService: AuthService,
              selectedIdSet: Set<number>,
              getSelectedProjectId: () => number) {
    super(mapService, (store: SimplifiedStore): StoreMappable => this.createStoreMappable(store), selectedIdSet);
    this.authService = authService;
    this.getSelectedProjectId = getSelectedProjectId;
  }

  private createStoreMappable(store: SimplifiedStore): StoreMappable {
    return new StoreMappable(store,
      this.authService.sessionUser.id,
      this.mapService,
      (s: SimplifiedStore) => this.selectedEntityIds.has(s.id),
      () => this.getSelectedProjectId(),
      this.iconProvider
    )
  }

}
