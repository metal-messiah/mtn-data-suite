import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { HttpClient } from '@angular/common/http';
import { CrudService } from '../../interfaces/crud-service';
import { StoreCasing } from '../../models/store-casing';
import { SimplifiedStoreVolume } from '../../models/simplified-store-volume';
import { SimplifiedProject } from '../../models/simplified-project';
import { Project } from '../../models/project';
import { SimplifiedStoreStatus } from '../../models/simplified-store-status';
import { StoreStatus } from '../../models/store-status';

@Injectable()
export class StoreCasingService extends CrudService<StoreCasing> {

  protected endpoint = '/api/store-casing';

  constructor(protected http: HttpClient, protected rest: RestService) {
    super(http, rest);
  }

  protected createEntityFromObj(entityObj): StoreCasing {
    return new StoreCasing(entityObj);
  }

  setStoreVolume(casing: StoreCasing, volume: SimplifiedStoreVolume) {
    const url = this.rest.getHost() + this.endpoint + `/${casing.id}/store-volume/${volume.id}`;

    return this.http.put<StoreCasing>(url, null, {headers: this.rest.getHeaders()})
      .map(updatedCasing => {
        return new StoreCasing(updatedCasing);
      });
  }

  removeStoreVolume(casing: StoreCasing) {
    const url = this.rest.getHost() + this.endpoint + `/${casing.id}/store-volume`;

    return this.http.delete<StoreCasing>(url, {headers: this.rest.getHeaders()})
      .map(updatedCasing => {
        return new StoreCasing(updatedCasing);
      });
  }

  addProject(casing: StoreCasing, project: SimplifiedProject | Project) {
    const url = this.rest.getHost() + this.endpoint + `/${casing.id}/projects/${project.id}`;

    return this.http.put<StoreCasing>(url, null, {headers: this.rest.getHeaders()})
      .map(updatedCasing => {
        return new StoreCasing(updatedCasing);
      });
  }

  removeProject(casing: StoreCasing, project: SimplifiedProject | Project) {
    const url = this.rest.getHost() + this.endpoint + `/${casing.id}/projects/${project.id}`;

    return this.http.delete<StoreCasing>(url, {headers: this.rest.getHeaders()})
      .map(updatedCasing => {
        return new StoreCasing(updatedCasing);
      });
  }

  setStoreStatus(casing: StoreCasing, status: SimplifiedStoreStatus | StoreStatus) {
    const url = this.rest.getHost() + this.endpoint + `/${casing.id}/store-status/${status.id}`;

    return this.http.put<StoreCasing>(url, null, {headers: this.rest.getHeaders()})
      .map(updatedCasing => {
        return new StoreCasing(updatedCasing);
      });
  }

}
