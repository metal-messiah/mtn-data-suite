import { Injectable } from "@angular/core";
import { BoundaryService } from "app/core/services/boundary.service";
import { Boundary } from "app/models/full/boundary";

import * as _ from "lodash";
import { ProjectBoundary } from "app/models/project-boundary";

import { BoundaryColor } from "./enums/boundary-color";
import { MapService } from "app/core/services/map.service";
import { AuthService } from "app/core/services/auth.service";
import { Pageable } from "app/models/pageable";

@Injectable({
  providedIn: "root"
})
export class BoundaryDialogService {
  private _projectBoundaries: Boundary[] = [];
  private _geoPoliticalBoundaries: Boundary[] = [];
  private _customBoundaries: Boundary[] = [];

  private _enabledProjectBoundaries: Boundary[] = [];
  private _enabledGeoPoliticalBoundaries: Boundary[] = [];
  private _enabledCustomBoundaries: Boundary[] = [];

  private polygons = [];

  private mapService: MapService;
  private gmap: google.maps.Map;

  deletingShapes = false;

  constructor(
    private boundaryService: BoundaryService,
    private authService: AuthService
  ) {}

  private geojsonStringToPolygon(inputGeojson: any): any {
    let geojson: any;
    if (typeof inputGeojson === "string") {
      geojson = JSON.parse(inputGeojson);
    } else {
      geojson = inputGeojson;
    }
    return geojson;
  }

  private stylePolygon(color: BoundaryColor, boundary: ProjectBoundary) {
    boundary.polygons.forEach(p => {
      p.setOptions({
        strokeColor: "#000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.15
      });
    });
    return boundary;
  }

  private drawEnabledBoundaries() {
    this.polygons.forEach(poly => poly.polygons.forEach(p => p.setMap(null)));
    this.polygons = Object.assign(
      [],
      this._enabledCustomBoundaries.map(boundary => {
        return this.stylePolygon(
          BoundaryColor.CUSTOM,
          this.convertBoundaryToProjectBoundary(boundary)
        );
      }),
      this._enabledGeoPoliticalBoundaries.map(boundary => {
        return this.stylePolygon(
          BoundaryColor.GEOPOLITICAL,
          this.convertBoundaryToProjectBoundary(boundary)
        );
      }),
      this._enabledProjectBoundaries.map(boundary => {
        return this.stylePolygon(
          BoundaryColor.PROJECT,
          this.convertBoundaryToProjectBoundary(boundary)
        );
      })
    );
  }

  private compareBoundaryGeojsonObjects(a: Boundary, b: Boundary) {
    return JSON.stringify(a.geojson) === JSON.stringify(b.geojson);
  }

  private async fetchCustomBoundaries() {
    const customBoundaries = await this.boundaryService
      .getUserBoundaries(this.authService.sessionUser.id)
      .toPromise();
    customBoundaries.forEach(b => {
      b = new Boundary(b);
      if (
        !this._customBoundaries.filter((cb: Boundary) => cb.id === b.id).length
      ) {
        this._customBoundaries.push(b);
      }
    });
  }

  private async fetchProjectBoundaries() {
    const projectBoundaries: Pageable<
      Boundary
    > = await this.boundaryService.getBoundaries().toPromise();
    // this._customBoundaries = customBoundaries.map(b => new Boundary(b));

    projectBoundaries.content.forEach(b => {
      b = new Boundary(b);
      if (
        !this._projectBoundaries.filter(
          (pb: Boundary) => pb.id === b.id && pb.legacyProjectId
        ).length
      ) {
        this._projectBoundaries.push(b);
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

  setEnabledCustomBoundaries(data) {
    this._enabledCustomBoundaries = data;
    this.drawEnabledBoundaries();
  }

  get enabledProjectBoundaries(): Boundary[] {
    return this._enabledProjectBoundaries;
  }

  get enabledGeoPoliticalBoundaries(): Boundary[] {
    return this._enabledGeoPoliticalBoundaries;
  }

  get enabledCustomBoundaries(): Boundary[] {
    return this._enabledCustomBoundaries;
  }

  get projectBoundaries(): Boundary[] {
    return this._projectBoundaries;
  }

  get geoPoliticalBoundaries(): Boundary[] {
    return this._geoPoliticalBoundaries;
  }

  get customBoundaries(): Boundary[] {
    return this._customBoundaries;
  }

  set customBoundaries(boundaries: Boundary[]) {
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
