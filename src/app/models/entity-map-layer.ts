import { MapPointLayer } from './map-point-layer';
import { Subject } from 'rxjs/Subject';
import { UserProfile } from './full/user-profile';
import { Coordinates } from './coordinates';
import { MarkerType } from '../core/functionalEnums/MarkerType';
import { MapSelectionMode } from '../casing/enums/map-selection-mode';
import { Entity } from './entity';
import { EntityMappable } from '../interfaces/entity-mappable';

export class EntityMapLayer<T extends EntityMappable> extends MapPointLayer<EntityMappable> {

  selection$ = new Subject<Entity>();

  selectionMode: MapSelectionMode = MapSelectionMode.SINGLE_SELECT;
  markerType: MarkerType = MarkerType.PIN;

  private selectedEntities: Entity[];

  private mappables: EntityMappable[];

  private selectedEntityIds: Set<string | number>;

  private readonly currentUser: UserProfile;

  private movingMappable: EntityMappable;

  private latestSelectedMappable: EntityMappable;

  constructor(private mappableType: new (entity: Entity, userProfile: UserProfile) => T,
              currentUser: UserProfile) {
    super();
    this.currentUser = currentUser;
    this.mappables = [];
    this.selectedEntityIds = new Set<number>();
    this.selectedEntities = [];
    this.initSelection();
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
      const newMappable = new this.mappableType(entity, this.currentUser);
      newMappable.setSelected(this.selectedEntityIds.has(entity.id));
      return newMappable;
    });
    this.clearMarkers();
    this.createMarkersFromMappables(this.mappables);
  }

  setMarkerType(markerType: MarkerType) {
    this.markerType = markerType;
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

  deselectEntity(entity: Entity) {
    const mappable = this.mappables.find((marker: EntityMappable) => marker.id === entity.id);
    if (mappable) {
      this.deselectMappable(mappable);
      this.refreshOptionsForMappable(mappable);
    } else {
      // Entity is no longer on the screen - mappable was deleted
    }
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
}
