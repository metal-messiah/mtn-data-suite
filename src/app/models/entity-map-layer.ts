import { MapPointLayer } from './map-point-layer';
import { Coordinates } from './coordinates';
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { MapSelectionMode } from '../casing/enums/map-selection-mode';
import { Entity } from './entity';
import { EntityMappable } from '../interfaces/entity-mappable';
import { Subject } from 'rxjs';
import { Mappable } from '../interfaces/mappable';
import { MapService } from '../core/services/map.service';

export class EntityMapLayer<T extends EntityMappable> extends MapPointLayer<EntityMappable> {

  selection$ = new Subject<Entity>();

  selectionMode: MapSelectionMode = MapSelectionMode.SINGLE_SELECT;
  markerType: MarkerType = MarkerType.PIN;

  private mappables: EntityMappable[];

  protected selectedEntityIds: Set<number>;

  private movingMappable: EntityMappable;

  private latestSelectedMappable: EntityMappable;

  private readonly createMappable: (Entity) => EntityMappable;

  constructor(mapService: MapService, createMappable: (Entity) => EntityMappable) {
    super(mapService);
    this.mappables = [];
    this.selectedEntityIds = new Set<number>();
    this.createMappable = createMappable;
    this.initSelection();
    const m = localStorage.getItem('markerType');
    if (m != null) {
      this.markerType = JSON.parse(m);
    }
  }

  private initSelection() {
    this.markerClick$.subscribe((clickedMappable: EntityMappable) => {

      if (this.selectionMode === MapSelectionMode.SINGLE_SELECT) {
        this.clearSelection();
        this.selectMappable(clickedMappable);
      } else if (this.selectionMode === MapSelectionMode.MULTI_SELECT) {
        this.selectMappable(clickedMappable);
      } else if (this.selectionMode === MapSelectionMode.MULTI_DESELECT) {
        this.deselectMappable(clickedMappable);
      }

      this.selection$.next(clickedMappable.getEntity());
    });
  }

  setEntities(entities: Entity[]) {
    this.mappables = entities.map(entity => {
      if (this.mappables.length > 0) {
        const mappable = this.mappables.find((em: EntityMappable) => em.getEntity().id === entity.id);
        if (mappable != null) {
          mappable.updateEntity(entity);
          return mappable;
        }
      }
      return this.createMappable(entity);
    });
    this.clearMarkers();
    this.createMarkersFromMappables(this.mappables);
    this.addToMap(this.mapService.getMap());
  }

  setMarkerType(markerType: MarkerType) {
    this.markerType = markerType;
    localStorage.setItem('markerType', JSON.stringify(markerType));
  }

  selectEntitiesWithIds(ids: number[]) {
    ids.forEach(id => this.selectedEntityIds.add(id));
    this.refreshOptions();
  }

  deselectEntitiesWithIds(ids: number[]) {
    ids.forEach(id => this.selectedEntityIds.delete(id));
    this.refreshOptions();
  }

  private getMappablesWithIds(ids: number[]): Mappable[] {
    return this.mappables.filter(mappable => ids.includes(mappable.getEntity().id));
  }

  clearSelection() {
    this.latestSelectedMappable = null;
    this.selectedEntityIds.clear();
    this.mappables.forEach((mappable: EntityMappable) => {
      this.refreshOptionsForMappable(mappable);
    });
  }

  startMovingEntity(entity: Entity) {
    const mappable = this.mappables.find((em: EntityMappable) => em.getEntity().id === entity.id);
    this.movingMappable = mappable;
    mappable.setMoving(true);
    this.refreshOptionsForMappable(mappable);
  }

  cancelMovingEntity() {
    if (this.movingMappable != null) {
      this.movingMappable.setMoving(false);
      this.resetPositionOfMappable(this.movingMappable);
      this.refreshOptionsForMappable(this.movingMappable);
      this.movingMappable = null;
    }
  }

  finishMovingEntity() {
    if (this.movingMappable != null) {
      this.movingMappable.setMoving(false);
      this.refreshOptionsForMappable(this.movingMappable);
      this.movingMappable = null;
    }
  }

  getMovedEntityCoordinates(): Coordinates {
    return this.getCoordinatesOfMappableMarker(this.movingMappable);
  }

  getMovedEntity() {
    return this.movingMappable.getEntity();
  }

  selectEntity(entity: Entity) {
    const mappable = this.mappables.find((em: EntityMappable) => em.getEntity().id === entity.id);
    this.selectMappable(mappable);
    this.refreshOptionsForMappable(mappable);
  }

  updateEntity(entity: Entity) {
    const mappable = this.mappables.find((em: EntityMappable) => em.getEntity().id === entity.id);
    mappable.updateEntity(entity);
    this.refreshOptionsForMappable(mappable);
  }

  getSelectionCount(): number {
    return this.selectedEntityIds.size;
  }

  getSelectedEntityIds(): number[] {
    return Array.from(this.selectedEntityIds);
  }

  private selectMappable(mappable: EntityMappable): void {
    this.selectedEntityIds.add(mappable.getEntity().id);
    this.refreshOptionsForMappable(mappable);
  }

  private deselectMappable(mappable: EntityMappable) {
    if (this.selectedEntityIds.delete(mappable.getEntity().id)) {
      this.refreshOptionsForMappable(mappable);
    }
  }

  isMoving() {
    return this.movingMappable != null;
  }

  protected setMarkerOptions(marker: google.maps.Marker): void {
    const mappable: Mappable = marker.get('mappable');
    marker.setDraggable(mappable.isDraggable());
    marker.setIcon(mappable.getIcon(this.markerType));
    marker.setLabel(mappable.getLabel(this.markerType));
  }
}
