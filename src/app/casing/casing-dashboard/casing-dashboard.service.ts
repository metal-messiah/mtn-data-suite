import { Injectable } from '@angular/core';
import { Project } from '../../models/full/project';
import { SelectProjectComponent } from '../select-project/select-project.component';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Site } from '../../models/full/site';
import { Observable } from 'rxjs/Observable';
import { SimplifiedProject } from '../../models/simplified/simplified-project';

@Injectable()
export class CasingDashboardService {

  // Filters
  includeActive = true;
  includeFuture = false;
  includeHistorical = false;

  private selectedProject: Project | SimplifiedProject;
  private _newSite: Site;

  constructor(private dialog: MatDialog,
              private router: Router) {
    const filters = JSON.parse(localStorage.getItem('casingDashboardFilters'));
    if (filters != null) {
      this.includeActive = filters.includeActive;
      this.includeFuture = filters.includeFuture;
      this.includeHistorical = filters.includeHistorical;
    }
    const selectedProject = JSON.parse(localStorage.getItem('selectedProject'));
    if (selectedProject != null) {
      this.selectedProject = new SimplifiedProject(selectedProject);
    }
  }

  openProjectSelectionDialog(): void {
    const dialogRef = this.dialog.open(SelectProjectComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'clear') {
        this.selectedProject = null;
        localStorage.removeItem('selectedProject');
      } else if (result != null) {
        this.selectedProject = result;
        localStorage.setItem('selectedProject', JSON.stringify(this.selectedProject));
      }
    });
  }

  navigateToProjectSummary(): void {
    if (this.selectedProject != null) {
      this.router.navigate(['/storeCasing/project-summary', this.selectedProject.id]);
    }
  }

  navigateToProjectDetail(): void {
    if (this.selectedProject != null) {
      this.router.navigate(['/storeCasing/project-detail', this.selectedProject.id]);
    }
  }

  get newSite(): Site {
    return this._newSite;
  }

  set newSite(value: Site) {
    this._newSite = value;
  }

  savePerspective(perspective: object): Observable<boolean> {
    return Observable.create(observer => {
      try {
        localStorage.setItem('casingDashboardPerspective', JSON.stringify(perspective));
        observer.next(true);
      } catch (e) {
        observer.error(e);
      }
    });
  }

  saveFilters(): Observable<boolean> {
    return Observable.create(observer => {
      try {
        localStorage.setItem('casingDashboardFilters', JSON.stringify({
          includeActive: this.includeActive,
          includeFuture: this.includeFuture,
          includeHistorical: this.includeHistorical
        }));
        observer.next(true);
      } catch (e) {
        observer.error(e);
      }
    });
  }

  getSavedPerspective(): Observable<any> {
    return Observable.create(observer => {
      try {
        const perspective = JSON.parse(localStorage.getItem('casingDashboardPerspective'));
        observer.next(perspective);
      } catch (e) {
        observer.error(e);
      }
    });
  }

  getSelectedProject() {
    return this.selectedProject;
  }

}
