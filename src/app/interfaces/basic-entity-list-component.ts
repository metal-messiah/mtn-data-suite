import { CrudService } from './crud-service';
import { Entity } from '../models/entity';

export interface BasicEntityListComponent<T extends Entity> {
  isLoading: boolean;
  isDeleting: boolean;

  confirmDelete: (entity: T) => void;
  getEntityService: () => CrudService<T>;
  getPluralTypeName: () => string;
  getTypeName: () => string;
  goBack: () => void;
  sortCompare: (a: T, b: T) => number;
  loadEntities: () => void;
}
