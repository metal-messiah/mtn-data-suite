import { Injectable } from '@angular/core';
import { BoundaryService } from 'app/core/services/boundary.service';
import { Boundary } from 'app/models/full/boundary';

import * as _ from 'lodash';
import { ProjectBoundary } from 'app/models/project-boundary';

import { BoundaryColor } from './enums/boundary-color';
import { MapService } from 'app/core/services/map.service';
import { AuthService } from 'app/core/services/auth.service';
import { Pageable } from 'app/models/pageable';
import { UserBoundaryService } from 'app/core/services/user-boundary.service';
import { UserBoundary } from 'app/models/full/user-boundary';
import { Project } from 'app/models/full/project';
import { ProjectService } from 'app/core/services/project.service';
import { SimplifiedProject } from 'app/models/simplified/simplified-project';
import { LiteralMapEntry } from '@angular/compiler/src/output/output_ast';

@Injectable({
  providedIn: 'root'
})
export class BoundaryDialogService {
  private _projectBoundaries: Project[] = [];
  private _geoPoliticalBoundaries: Boundary[] = [];
  private _customBoundaries: UserBoundary[] = [];

  private _enabledProjectBoundaries: Project[] = [];
  private _enabledGeoPoliticalBoundaries: Boundary[] = [];
  private _enabledCustomBoundaries: UserBoundary[] = [];

  private polygons = [];

  private mapService: MapService;
  private gmap: google.maps.Map;

  deletingShapes = false;

  constructor(
    private userBoundaryService: UserBoundaryService,
    private boundaryService: BoundaryService,
    private authService: AuthService,
    private projectService: ProjectService
  ) {}

  private geojsonStringToPolygon(inputGeojson: any): any {
    let geojson: any;
    if (typeof inputGeojson === 'string') {
      geojson = JSON.parse(inputGeojson);
    } else {
      geojson = inputGeojson;
    }
    return geojson;
  }

  private stylePolygon(color: BoundaryColor, boundary: ProjectBoundary) {
    boundary.polygons.forEach(p => {
      p.setOptions({
        strokeColor: '#000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.15
      });
    });
    return boundary;
  }

  async getCustomBoundariesFromEnabled() {
    const promises = [];
    this._enabledCustomBoundaries.forEach((boundary: UserBoundary) => {
      promises.push(
        this.boundaryService.getOneById(boundary.boundaryId).toPromise()
      );
    });
    return Promise.all(promises);
  }

  async getProjectBoundariesFromEnabled() {
    const promises = [];
    this._enabledProjectBoundaries.forEach((project: Project) => {
      promises.push(
        this.projectService.getBoundaryForProject(project.id).toPromise()
      );
    });
    return Promise.all(promises);
  }

  getStyledPolygonFromBoundaries(boundaries: Boundary[]) {
    return boundaries.map(boundary => {
      return this.stylePolygon(
        BoundaryColor.CUSTOM,
        this.convertBoundaryToProjectBoundary(boundary)
      );
    });
  }

  private async drawEnabledBoundaries() {
    this.polygons.forEach(poly => poly.removeFromMap());

    const customBoundaries = await this.getCustomBoundariesFromEnabled();
    const projectBoundaries = await this.getProjectBoundariesFromEnabled();

    const cbPolygons = this.getStyledPolygonFromBoundaries(customBoundaries);
    const pbPolygons = this.getStyledPolygonFromBoundaries(projectBoundaries);

    this.polygons = cbPolygons.concat(pbPolygons);
  }

  private async fetchCustomBoundaries() {
    const customBoundaries = await this.userBoundaryService
      .getUserBoundaries(this.authService.sessionUser.id)
      .toPromise();

    // tracking checkbox state without local storage
    customBoundaries.forEach(b => {
      b = new UserBoundary(b);
      if (
        !this._customBoundaries.filter((cb: UserBoundary) => cb.id === b.id)
          .length
      ) {
        this._customBoundaries.push(b);
      }
    });
  }

  private async fetchProjectBoundaries() {
    const projectBoundaries: Pageable<
      Project
    > = await this.projectService
      .getAllByQuery(null, null, null, null, true)
      .toPromise();

    // tracking checkbox state without local storage
    projectBoundaries.content.forEach((p: any) => {
      if (p.hasBoundary) {
        if (
          !this._projectBoundaries.filter((pb: Project) => pb.id === p.id)
            .length
        ) {
          this._projectBoundaries.push(p);
        }
      }
    });
  }

  convertBoundaryToProjectBoundary(boundary: Boundary): ProjectBoundary {
    return new ProjectBoundary(
      this.gmap,
      this.geojsonStringToPolygon(boundary.geojson)
    );
  }

  convertProjectBoundaryToBoundary(projectBoundary: ProjectBoundary): Boundary {
    return new Boundary({
      geojson: projectBoundary.geojson,
      boundaryName: projectBoundary.name
    });
  }

  fetchBoundaries() {
    this.fetchCustomBoundaries();
    this.fetchProjectBoundaries();
    this._geoPoliticalBoundaries = [];
  }

  setMap(mapService) {
    this.mapService = mapService;
    this.gmap = mapService.getMap();
  }

  setEnabledProjectBoundaries(data) {
    this._enabledProjectBoundaries = data;
    this.drawEnabledBoundaries();
  }

  setEnabledGeoPoliticalBoundaries(data) {
    this._enabledGeoPoliticalBoundaries = data;
    this.drawEnabledBoundaries();
  }

  async setEnabledCustomBoundaries(data) {
    this._enabledCustomBoundaries = data;
    this.drawEnabledBoundaries();
  }

  get enabledProjectBoundaries(): Project[] {
    return this._enabledProjectBoundaries;
  }

  get enabledGeoPoliticalBoundaries(): Boundary[] {
    return this._enabledGeoPoliticalBoundaries;
  }

  get enabledCustomBoundaries(): UserBoundary[] {
    return this._enabledCustomBoundaries;
  }

  get projectBoundaries(): Project[] {
    return this._projectBoundaries;
  }

  get geoPoliticalBoundaries(): Boundary[] {
    return this._geoPoliticalBoundaries;
  }

  get customBoundaries(): UserBoundary[] {
    return this._customBoundaries;
  }

  set customBoundaries(boundaries: UserBoundary[]) {
    this._customBoundaries = boundaries;
  }

  cancelBoundaryEditing(b: ProjectBoundary) {
    // If a boundary exists with shapes, make it non-editable, and reset it's shapes
    if (b) {
      if (b.geojson) {
        b.resetFromGeoJson();
        if (b.isEditable()) {
          this.mapService.deactivateDrawingTools();
          b.setEditable(false);
        }
      } else {
        b.removeFromMap();
      }
    }
  }

  enableShapeDeletion(b: ProjectBoundary) {
    this.deletingShapes = true;
    b.enableDeletion();
  }

  disableShapeDeletion(b: ProjectBoundary) {
    this.deletingShapes = false;
    b.disableDeletion();
  }

  zoomToBoundary(boundary: ProjectBoundary) {
    if (boundary.hasShapes()) {
      boundary.zoomToBounds();
    }
  }
}
