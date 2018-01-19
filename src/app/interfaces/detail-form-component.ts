import {FormGroup} from '@angular/forms';
import {EntityService} from './entity-service';
import {ActivatedRoute} from '@angular/router';

export interface DetailFormComponent<T> {
  isLoading: boolean;
  isSaving: boolean;

  createForm: () => void;
  getForm: () => FormGroup;
  getNewObj: () => T;
  getObj: () => T;
  getObjService: () => EntityService<T>;
  getRoute: () => ActivatedRoute;
  getSavableObj: () => T;
  getTypeName: () => string;
  goBack: () => void;
  onObjectChange: () => void;
  setObj: (obj: T) => void;
}
