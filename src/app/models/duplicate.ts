import { List } from 'lodash';

export class Duplicate<T> {
  entities: T[];

  constructor(obs:T[]) {
    this.entities = obs;
  }

  getEntities(): T[] {
    return this.entities;
  }

}