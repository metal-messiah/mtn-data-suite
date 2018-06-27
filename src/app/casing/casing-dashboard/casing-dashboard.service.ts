import { Injectable } from '@angular/core';
import { Project } from '../../models/full/project';
import { SelectProjectComponent } from '../select-project/select-project.component';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { SimplifiedProject } from '../../models/simplified/simplified-project';
import { Observable, Subject } from 'rxjs/index';

@Injectable()
export class CasingDashboardService {

  // Filters
  includeActive = true;
  includeFuture = false;
  includeHistorical = false;

  projectChanged$: Subject<Project | SimplifiedProject>;

  private selectedProject: Project | SimplifiedProject;

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
    this.projectChanged$ = new Subject<Project>();
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
      this.projectChanged$.next(this.selectedProject);
    });
  }

  navigateToProjectSummary(): void {
    // TODO Change to dialog
    // if (this.selectedProject != null) {
    //   this.router.navigate(['/storeCasing/project-summary', this.selectedProject.id]);
    // }
  }

  navigateToProjectDetail(): void {
    if (this.selectedProject != null) {
      this.router.navigate(['casing', 'project', this.selectedProject.id]);
    }
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

  getSelectedProject() {
    return this.selectedProject;
  }

}
