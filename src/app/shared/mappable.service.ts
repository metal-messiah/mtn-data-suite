import { Injectable } from '@angular/core';
import { Mappable } from '../interfaces/mappable';

@Injectable()
export class MappableService<T extends Mappable> {

  private mappables: T[];
  private latestSelected: T;
  private selectedMappables: T[];
  private selectedMappableIds: Set<(string|number)>;

  constructor() {
    this.mappables = [];
    this.selectedMappableIds = new Set();
    this.selectedMappables = [];
  }

  setMappables(mappables: T[]) {
    this.mappables = mappables;
  }

  deselectAll() {
    this.selectedMappableIds = new Set();
    this.selectedMappables = [];
  }

  selectMappable(mappable: T): void {
    this.latestSelected = mappable;
    if (!this.selectedMappableIds.has(mappable.id)) {
      this.selectedMappableIds.add(mappable.id);
      this.selectedMappables.push(mappable);
    }
  }

  selectMappables(mappables: T[]): void {
    mappables.forEach(mappable => this.selectMappable(mappable));
  }

  deselectMappable(mappable: T): void {
    if (this.selectedMappableIds.has(mappable.id)) {
      this.selectedMappableIds.delete(mappable.id);
      const index = this.selectedMappables.findIndex((item, i, array) => {
        return item.id === mappable.id;
      });
      this.selectedMappables.splice(index, 1);
    }
  }

  deselectMappables(mappables: T[]): void {
    mappables.forEach(mappable => this.deselectMappable(mappable));
  }

  mappableIsSelected(mappable: T): boolean {
    return this.selectedMappableIds.has(mappable.id);
  }

  getLatestSelection(): T {
    return this.latestSelected;
  }

  getSelectedIds(): (number | string)[] {
    return Array.from(this.selectedMappableIds);
  }

  getSelectedMappables(): T[] {
    return this.selectedMappables;
  }

  getNumSelected(): number {
    return this.selectedMappableIds.size;
  }

  getMappables(): T[] {
    return this.mappables;
  }
}
