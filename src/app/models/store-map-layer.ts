import { EntityMapLayer } from './entity-map-layer';
import { StoreMappable } from './store-mappable';
import { SimplifiedStore } from './simplified/simplified-store';
import { AuthService } from '../core/services/auth.service';
import { MapService } from '../core/services/map.service';
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { StoreIconProvider } from '../utils/StoreIconProvider';
import { ValidationIconProvider } from '../utils/ValidationIconProvider';
import { LogoIconProvider } from '../utils/LogoIconProvider';
import { ProjectCompletionIconProvider } from '../utils/ProjectCompletionIconProvider';

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
    const markerTypeValue = localStorage.getItem('markerType');
    if (markerTypeValue) {
      this.setMarkerType(markerTypeValue as MarkerType);
    }
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

  setMarkerType(markerType: MarkerType) {
    if (markerType === MarkerType.VALIDATION) {
      this.iconProvider = new ValidationIconProvider(this.mapService);
    } else if (markerType === MarkerType.LOGO) {
      this.iconProvider = new LogoIconProvider(this.mapService);
    } else if (markerType === MarkerType.PROJECT_COMPLETION) {
      this.iconProvider = new ProjectCompletionIconProvider(this.mapService, this.getSelectedProjectId)
    } else {
      this.iconProvider = new StoreIconProvider(this.mapService);
    }
    this.markerType = markerType;
    localStorage.setItem('markerType', markerType);
    this.mappables.forEach((m: StoreMappable) => m.setStoreIconProvider(this.iconProvider));
  }
}
