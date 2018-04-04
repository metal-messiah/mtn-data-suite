import { Injectable } from '@angular/core';
import { Project } from '../models/project';
import { SelectProjectComponent } from './select-project/select-project.component';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Site } from '../models/site';

@Injectable()
export class CasingService {

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
      this.router.navigate(['/casing/project-summary', this.selectedProject.id]);
    }
  }

  navigateToProjectDetail(): void {
    if (this.selectedProject != null) {
      this.router.navigate(['/casing/project-detail', this.selectedProject.id]);
    }
  }


  get newSite(): Site {
    return this._newSite;
  }

  set newSite(value: Site) {
    this._newSite = value;
  }
}
