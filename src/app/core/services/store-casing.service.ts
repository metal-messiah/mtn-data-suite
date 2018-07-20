import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { HttpClient } from '@angular/common/http';
import { CrudService } from '../../interfaces/crud-service';
import { StoreCasing } from '../../models/full/store-casing';
import { SimplifiedStoreVolume } from '../../models/simplified/simplified-store-volume';
import { SimplifiedProject } from '../../models/simplified/simplified-project';
import { Project } from '../../models/full/project';
import { StoreVolume } from '../../models/full/store-volume';
import { map } from 'rxjs/internal/operators';

@Injectable()
export class StoreCasingService extends CrudService<StoreCasing> {

  protected endpoint = '/api/store-casing';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): StoreCasing {
    return new StoreCasing(entityObj);
  }

  createNewVolume(storeCasingId: number, volume: StoreVolume) {
    const url = this.rest.getHost() + this.endpoint + `/${storeCasingId}/store-volume`;

    return this.http.post<StoreCasing>(url, volume, {headers: this.rest.getHeaders()})
      .pipe(map(updatedCasing => new StoreCasing(updatedCasing)));
  }

  setStoreVolume(casing: StoreCasing, volume: SimplifiedStoreVolume) {
    const url = this.rest.getHost() + this.endpoint + `/${casing.id}/store-volume/${volume.id}`;

    return this.http.put<StoreCasing>(url, null, {headers: this.rest.getHeaders()})
      .pipe(map(updatedCasing => new StoreCasing(updatedCasing)));
  }

  removeStoreVolume(casing: StoreCasing) {
    const url = this.rest.getHost() + this.endpoint + `/${casing.id}/store-volume`;

    return this.http.delete<StoreCasing>(url, {headers: this.rest.getHeaders()})
      .pipe(map(updatedCasing => new StoreCasing(updatedCasing)));
  }

  addProject(casing: StoreCasing, project: SimplifiedProject | Project) {
    const url = this.rest.getHost() + this.endpoint + `/${casing.id}/projects/${project.id}`;

    return this.http.put<StoreCasing>(url, null, {headers: this.rest.getHeaders()})
      .pipe(map(updatedCasing => new StoreCasing(updatedCasing)));
  }

  removeProject(casing: StoreCasing, project: SimplifiedProject | Project) {
    const url = this.rest.getHost() + this.endpoint + `/${casing.id}/projects/${project.id}`;

    return this.http.delete<StoreCasing>(url, {headers: this.rest.getHeaders()})
      .pipe(map(updatedCasing => new StoreCasing(updatedCasing)));
  }

}
