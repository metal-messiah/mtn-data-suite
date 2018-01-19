import {EntityService} from './entity-service';

export interface BasicEntityListComponent<T> {
  isLoading: boolean;
  isDeleting: boolean;

  confirmDelete: (entity: T) => void;
  getEntityService: () => EntityService<T>;
  getPluralTypeName: () => string;
  getTypeName: () => string;
  goBack: () => void;
  sortCompare: (a: T, b: T) => number;
  setEntities: (entities: T[]) => void;
}
