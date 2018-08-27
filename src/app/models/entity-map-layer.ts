import { MapPointLayer } from './map-point-layer';
import { Coordinates } from './coordinates';
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { MapSelectionMode } from '../casing/enums/map-selection-mode';
import { Entity } from './entity';
import { EntityMappable } from '../interfaces/entity-mappable';
import { Subject } from 'rxjs';
import { Mappable } from '../interfaces/mappable';

export class EntityMapLayer<T extends EntityMappable> extends MapPointLayer<EntityMappable> {

  selection$ = new Subject<Entity>();

  selectionMode: MapSelectionMode = MapSelectionMode.SINGLE_SELECT;
  markerType: MarkerType = MarkerType.PIN;

  private selectedEntities: Entity[];

  private mappables: EntityMappable[];

  private selectedEntityIds: Set<string | number>;

  private movingMappable: EntityMappable;

  private latestSelectedMappable: EntityMappable;

  private readonly createMappable: (Entity) => EntityMappable;

  constructor(map: google.maps.Map, createMappable: (Entity) => EntityMappable) {
    super(map);
    this.mappables = [];
    this.selectedEntityIds = new Set<number>();
    this.selectedEntities = [];
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
        const mappable = this.mappables.find((m: EntityMappable) => m.id === entity.id);
        if (mappable != null) {
          mappable.updateEntity(entity);
          return mappable;
        }
      }
      const newMappable = this.createMappable(entity);
      newMappable.setSelected(this.selectedEntityIds.has(entity.id));
      return newMappable;
    });
    this.clearMarkers();
    this.createMarkersFromMappables(this.mappables);
    this.addToMap(this.map);
  }

  setMarkerType(markerType: MarkerType) {
    this.markerType = markerType;
    localStorage.setItem('markerType', JSON.stringify(markerType));
  }

  selectEntitiesInShape(shape) {
    const mappables = this.getMappablesInShape(shape);
    mappables.forEach((mappable: EntityMappable) => this.selectMappable(mappable));
    this.refreshOptions();
  }

  deselectEntitiesInShape(shape) {
    const mappables = this.getMappablesInShape(shape);
    mappables.forEach((mappable: EntityMappable) => this.deselectMappable(mappable));
    this.refreshOptions();
  }

  clearSelection() {
    this.latestSelectedMappable = null;
    this.selectedEntityIds.clear();
    this.selectedEntities = [];
    this.mappables.forEach((mappable: EntityMappable) => {
      mappable.setSelected(false);
      this.refreshOptionsForMappable(mappable);
    });
  }

  startMovingEntity(entity: Entity) {
    const mappable = this.mappables.find((marker: EntityMappable) => marker.id === entity.id);
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
    const mappable = this.mappables.find((marker: EntityMappable) => marker.id === entity.id);
    this.selectMappable(mappable);
    this.refreshOptionsForMappable(mappable);
  }

  updateEntity(entity: Entity) {
    const mappable = this.mappables.find((marker: EntityMappable) => marker.id === entity.id);
    mappable.updateEntity(entity);
    this.refreshOptionsForMappable(mappable);
  }

  getSelectedEntities() {
    return this.selectedEntities;
  }

  private selectMappable(mappable: EntityMappable): void {
    mappable.setSelected(true);
    this.refreshOptionsForMappable(mappable);
    if (!this.selectedEntityIds.has(mappable.id)) {
      this.selectedEntityIds.add(mappable.id);
      this.selectedEntities.push(mappable.getEntity());
    }
  }

  private deselectMappable(mappable: EntityMappable) {
    mappable.setSelected(false);
    this.refreshOptionsForMappable(mappable);
    if (this.selectedEntityIds.has(mappable.id)) {
      this.selectedEntityIds.delete(mappable.id);
      const index = this.selectedEntities.findIndex((s: Entity) => {
        return s.id === mappable.getEntity().id;
      });
      this.selectedEntities.splice(index, 1);
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
