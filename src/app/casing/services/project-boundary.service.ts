import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

import { SimplifiedProject } from '../../models/simplified/simplified-project';
import { Boundary } from '../../models/full/boundary';
import { ProjectBoundary } from '../../models/project-boundary';
import { ProjectService } from '../../core/services/project.service';
import { CasingDashboardService } from '../casing-dashboard/casing-dashboard.service';
import { MapService } from '../../core/services/map.service';

/*
  Consumers of this service can:
  - Show project boundaries
  - Hide project boundaries
  - Start editing project boundary
     - Enable shape deletion
     - Disable shape deletion
  - Cancel editing project boundary
  - Complete editing project boundary
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectBoundaryService {

  // Project Editing flags
  deletingProjectShapes = false;

  projectBoundary: ProjectBoundary;

  constructor(private projectService: ProjectService,
              private casingDashboardService: CasingDashboardService) {
  }

  showProjectBoundaries(map: google.maps.Map) {
    return this.projectService.getBoundaryForProject(this.casingDashboardService.getSelectedProject().id)
      .pipe(tap((boundary: Boundary) => {
        if (boundary == null) {
          this.projectBoundary = new ProjectBoundary(map);
          this.projectBoundary.setEditable(false);
        } else {
          this.projectBoundary = new ProjectBoundary(map, JSON.parse(boundary.geojson));
        }
      }));
  }

  hideProjectBoundaries(mapService: MapService) {
    this.cancelProjectBoundaryEditing(mapService);
    if (this.projectBoundary) {
      this.projectBoundary.removeFromMap();
      this.projectBoundary = null;
    }
  }

  cancelProjectBoundaryEditing(mapService: MapService) {
    // If a boundary exists with shapes, make it non-editable, and reset it's shapes
    if (this.projectBoundary) {
      if (this.projectBoundary.geojson) {
        this.projectBoundary.resetFromGeoJson();
        if (this.projectBoundary.isEditable()) {
          this.deactivateEditingMode(mapService);
        }
      } else {
        this.projectBoundary.removeFromMap();
        this.projectBoundary = null;
      }
    }
  }

  saveProjectBoundaries(mapService: MapService) {
    if (this.projectBoundary.hasShapes()) {
      const geojson = this.projectBoundary.toGeoJson();
      const boundary = new Boundary({geojson: geojson});
      return this.projectService.saveBoundaryForProject(this.casingDashboardService.getSelectedProject().id, boundary)
        .pipe(tap((project: SimplifiedProject) => {
          this.casingDashboardService.setSelectedProject(project);
          this.deactivateEditingMode(mapService);
          this.projectBoundary.setGeoJson(JSON.parse(geojson));
        }));
    } else {
      // If no shapes - just delete the boundary
      return this.projectService.deleteBoundaryForProject(this.casingDashboardService.getSelectedProject().id)
        .pipe(tap((project: SimplifiedProject) => {
          this.casingDashboardService.setSelectedProject(project);
          this.deactivateEditingMode(mapService);
          this.projectBoundary.removeFromMap();
          this.projectBoundary = null;
        }));
    }
  }

  enableProjectShapeDeletion() {
    this.deletingProjectShapes = true;
    this.projectBoundary.enableDeletion();
  }

  disableProjectShapeDeletion() {
    this.deletingProjectShapes = false;
    this.projectBoundary.disableDeletion();
  }

  isShowingBoundary() {
    return this.projectBoundary != null;
  }

  zoomToProjectBoundary() {
    this.projectBoundary.zoomToBounds();
  }

  private deactivateEditingMode(mapService: MapService) {
    mapService.deactivateDrawingTools();
    this.projectBoundary.setEditable(false);
    this.deletingProjectShapes = false;
  }

}
