import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

import { SimplifiedProject } from '../../models/simplified/simplified-project';
import { Boundary } from '../../models/full/boundary';
import { ProjectBoundary } from '../../models/project-boundary';
import { ProjectService } from '../../core/services/project.service';
import { MapService } from '../../core/services/map.service';
import { CasingDashboardService } from '../casing-dashboard/casing-dashboard.service';

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
              private mapService: MapService,
              private casingDashboardService: CasingDashboardService) {
  }

  showProjectBoundaries() {
    return this.projectService.getBoundaryForProject(this.casingDashboardService.getSelectedProject().id)
      .pipe(tap((boundary: Boundary) => {
        if (boundary == null) {
          this.projectBoundary = new ProjectBoundary(this.mapService.getMap());
          this.projectBoundary.setEditable(false);
        } else {
          this.projectBoundary = new ProjectBoundary(this.mapService.getMap(), JSON.parse(boundary.geojson));
          this.projectBoundary.zoomToBounds();
        }
      }));
  }

  hideProjectBoundaries() {
    this.cancelProjectBoundaryEditing();
    if (this.projectBoundary) {
      this.projectBoundary.removeFromMap();
      this.projectBoundary = null;
    }
  }

  enableProjectBoundaryEditing() {
    this.mapService.setDrawingModeToPolygon();
    if (!this.projectBoundary) {
      this.showProjectBoundaries().subscribe(() => this.setUpProjectEditing());
    } else {
      this.setUpProjectEditing();
    }
  }

  cancelProjectBoundaryEditing() {
    // If a boundary exists with shapes, make it non-editable, and reset it's shapes
    if (this.projectBoundary && this.projectBoundary.geojson) {
      this.projectBoundary.resetFromGeoJson();
      if (this.projectBoundary.isEditable()) {
        this.deactivateEditingMode();
      }
    } else {
      // If the boundary is new, it won't yet have geojson and can be discarded
      this.projectBoundary = null;
    }
  }

  saveProjectBoundaries() {
    if (this.projectBoundary.hasShapes()) {
      const geoJson = this.projectBoundary.toGeoJson();
      return this.projectService.saveBoundaryForProject(this.casingDashboardService.getSelectedProject().id, geoJson)
        .pipe(tap((project: SimplifiedProject) => {
          this.casingDashboardService.setSelectedProject(project);
          this.deactivateEditingMode();
          this.projectBoundary.setGeoJson(JSON.parse(geoJson));
        }));
    } else {
      // If no shapes - just delete the boundary
      return this.projectService.deleteBoundaryForProject(this.casingDashboardService.getSelectedProject().id)
        .pipe(tap((project: SimplifiedProject) => {
          this.casingDashboardService.setSelectedProject(project);
          this.deactivateEditingMode();
          this.projectBoundary.removeFromMap();
          this.projectBoundary = null;
        }));
    }
  }

  enableProjectShapeDeletion() {
    this.mapService.setDrawingModeToClick();
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

  private setUpProjectEditing() {
    if (!this.projectBoundary.isEditable()) {
      this.projectBoundary.setEditable(true);
      this.mapService.activateDrawingTools()
        .subscribe(shape => this.projectBoundary.addShape(shape));
      this.projectBoundary.setEditable(true);
    }
  }

  private deactivateEditingMode() {
    this.projectBoundary.setEditable(false);
    this.mapService.deactivateDrawingTools();
    this.deletingProjectShapes = false;
  }

}
