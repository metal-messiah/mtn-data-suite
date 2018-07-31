import { Injectable } from '@angular/core';
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

  showingBoundaries = false;
  markCasedStores = false;

  toggleMarkingStores$: Subject<boolean>;
  toggleProjectBoundary$: Subject<boolean>;
  editProjectBoundary$: Subject<SimplifiedProject>;

  projectChanged$: Subject<SimplifiedProject>;

  private selectedProject: SimplifiedProject;

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
    const markCasedStores = JSON.parse(localStorage.getItem('markCasedStores'));
    if (markCasedStores != null) {
      this.markCasedStores = markCasedStores;
    }
    this.projectChanged$ = new Subject<SimplifiedProject>();
    this.toggleMarkingStores$ = new Subject<boolean>();
    this.toggleProjectBoundary$ = new Subject<boolean>();
    this.editProjectBoundary$ = new Subject<SimplifiedProject>();
  }

  openProjectSelectionDialog(): void {
    const dialogRef = this.dialog.open(SelectProjectComponent, {maxWidth: '400px'});

    dialogRef.afterClosed().subscribe(result => {
      if (result == null) {
        return;
      }
      if (result === 'clear') {
        this.selectedProject = null;
        localStorage.removeItem('selectedProject');
      } else if (result != null) {
        this.selectedProject = result;
        localStorage.setItem('selectedProject', JSON.stringify(this.selectedProject));
      }
      this.projectChanged$.next(this.selectedProject);
      this.markStoresCasedForProject(false);
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

  markStoresCasedForProject(doMark: boolean) {
    this.markCasedStores = doMark;
    this.toggleMarkingStores$.next(doMark);
    localStorage.setItem('markCasedStores', JSON.stringify(this.markCasedStores));
  }

  toggleSelectedProjectBoundary(doShow: boolean) {
    this.showingBoundaries = doShow;
    this.toggleProjectBoundary$.next(doShow);
  }

  editProjectBoundary() {
    this.editProjectBoundary$.next(this.selectedProject);
  }
}
