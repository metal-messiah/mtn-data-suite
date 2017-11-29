export class Pageable<T> {

  content: T[];
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  sort: string;
  first: boolean;
  numberOfElements: number;

}
