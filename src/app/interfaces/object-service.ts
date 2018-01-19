import {Observable} from 'rxjs/Observable';
import {Pageable} from '../models/pageable';

export interface ObjectService<T> {
  save: (obj: T) => Observable<T>;
  del: (obj: T) => Observable<T>;
  getOneById: (id: number) => Observable<T>;
  getAll: () => Observable<Pageable<T>>;
}
