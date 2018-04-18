import { FormGroup } from '@angular/forms';
import { CrudService } from './crud-service';
import { ActivatedRoute } from '@angular/router';
import { Entity } from '../models/entity';

export interface DetailFormComponent<T extends Entity> {
  isLoading: boolean;
  isSaving: boolean;

  createForm: () => void;
  getForm: () => FormGroup;
  getNewObj: () => T;
  getObj: () => T;
  getEntityService: () => CrudService<T>;
  getRoute: () => ActivatedRoute;
  getSavableObj: () => T;
  getTypeName: () => string;
  goBack: () => void;
  onObjectChange: () => void;
  setObj: (obj: T) => void;
  setDisabledFields: () => void;
}
