import { Injectable } from '@angular/core';
import { Mappable } from '../interfaces/mappable';

@Injectable()
export class MappableService {

  mappables: Mappable[];
  latestSelected: Mappable;
  private selectedMappableIds: Set<(string|number)>;
  numSelected = 0;

  constructor() {
    this.mappables = [];
    this.selectedMappableIds = new Set();
  }

  setMappables(mappables: Mappable[]) {
    this.mappables = mappables;
  }

  deselectAll() {
    this.selectedMappableIds = new Set();
  }

  selectMappable(mappable: Mappable): void {
    this.latestSelected = mappable;
    this.selectedMappableIds.add(mappable.id);
    this.numSelected = this.selectedMappableIds.size;
  }

  selectMappables(mappables: Mappable[]): void {
    mappables.forEach(mappable => this.selectMappable(mappable));
  }

  deselectMappable(mappable: Mappable): void {
    this.selectedMappableIds.delete(mappable.id);
    this.numSelected = this.selectedMappableIds.size;
  }

  deselectMappables(mappables: Mappable[]): void {
    mappables.forEach(mappable => this.deselectMappable(mappable));
  }

  mappableIsSelected(mappable: Mappable): boolean {
    return this.selectedMappableIds.has(mappable.id);
  }

  getLatestSelection() {
    return this.latestSelected;
  }
}
