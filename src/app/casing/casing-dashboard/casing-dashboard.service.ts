import { Injectable } from '@angular/core';
import { Project } from '../../models/full/project';
import { SelectProjectComponent } from '../select-project/select-project.component';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Site } from '../../models/full/site';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CasingDashboardService {

  selectedProject: Project;
  private _newSite: Site;

  constructor(private dialog: MatDialog,
              private router: Router) { }

  openProjectSelectionDialog(): void {
    const dialogRef = this.dialog.open(SelectProjectComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'clear') {
        this.selectedProject = null;
      } else if (result != null) {
        this.selectedProject = result;
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
    return Observable.create( observer => {
      try {
        localStorage.setItem('casingDashboardPerspective', JSON.stringify(perspective));
        observer.next(true);
      } catch (e) {
        observer.error(e);
      }
    });
  }

  saveFilters(filters): Observable<boolean> {
    return Observable.create( observer => {
      try {
        localStorage.setItem('casingDashboardFilters', JSON.stringify(filters));
        observer.next(true);
      } catch (e) {
        observer.error(e);
      }
    });
  }

  getSavedPerspective(): Observable<any> {
    return Observable.create( observer => {
      try {
        const perspective = JSON.parse(localStorage.getItem('casingDashboardPerspective'));
        observer.next(perspective);
      } catch (e) {
        observer.error(e);
      }
    });
  }

  getSavedFilters(): Observable<any> {
    return Observable.create( observer => {
      try {
        const filters = JSON.parse(localStorage.getItem('casingDashboardFilters'));
        observer.next(filters);
      } catch (e) {
        observer.error(e);
      }
    });
  }

}
