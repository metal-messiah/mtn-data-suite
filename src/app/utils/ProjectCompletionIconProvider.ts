import { SimplifiedStore } from '../models/simplified/simplified-store';
import { StoreIconProvider } from './StoreIconProvider';
import { MarkerShape } from '../core/functionalEnums/MarkerShape';
import { MapService } from '../core/services/map.service';

export class ProjectCompletionIconProvider extends StoreIconProvider {

  getSelectedProjectId: () => number;

  constructor(mapService: MapService, getSelectedProjectId: () => number) {
    super(mapService);
    this.getSelectedProjectId = getSelectedProjectId;
  }

  getLabel(store: SimplifiedStore) {
    return this.storeCasedForSelectedProject(store) ? null : super.getLabel(store);
  }

  protected getShape(store: SimplifiedStore) {
    return this.storeCasedForSelectedProject(store) ? MarkerShape.CHECKED_CIRCLE : super.getShape(store);
  }

  protected getScale(store: SimplifiedStore): number {
    return this.storeCasedForSelectedProject(store) ? 0.03 : super.getScale(store);
  }

  protected getStrokeWeight(store: SimplifiedStore) {
    return this.storeCasedForSelectedProject(store) ? 1.2 : super.getStrokeWeight(store);
  }

  private storeCasedForSelectedProject(store: SimplifiedStore) {
    const selectedProjectId = this.getSelectedProjectId();
    return selectedProjectId && store.projectIds && store.projectIds.indexOf(selectedProjectId) !== -1;
  }

}
