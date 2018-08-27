import { Injectable } from '@angular/core';
import { SelectProjectComponent } from '../select-project/select-project.component';
import { MatDialog } from '@angular/material';
import { SimplifiedProject } from '../../models/simplified/simplified-project';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class CasingDashboardService {

  // Filters
  includeActive = true;
  includeFuture = false;
  includeHistorical = false;

  projectChanged$: Subject<SimplifiedProject>;

  private selectedProject: SimplifiedProject;

  constructor(private dialog: MatDialog) {
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
    this.projectChanged$ = new Subject<SimplifiedProject>();
  }

  openProjectSelectionDialog(): void {
    const dialogRef = this.dialog.open(SelectProjectComponent, {maxWidth: '90%'});

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'clear') {
        this.setSelectedProject(null);
      } else if (result) {
        this.setSelectedProject(result);
      }
    });
  }

  setSelectedProject(project: SimplifiedProject) {
    const prevProject = this.selectedProject;
    this.selectedProject = project;
    if (project) {
      localStorage.setItem('selectedProject', JSON.stringify(project));
    } else {
      localStorage.removeItem('selectedProject');
    }
    // If there was no previous project OR if the selected project is not the same as previous
    if (!prevProject || (this.selectedProject && prevProject.id !== this.selectedProject.id)) {
      this.projectChanged$.next(this.selectedProject);
    }
  }

  getSelectedProject() {
    return this.selectedProject;
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
}
