import { Injectable } from '@angular/core';
import { SimplifiedProject } from '../models/simplified/simplified-project';
import { Subject } from 'rxjs';
import { StorageService } from '../core/services/storage.service';
import { SelectProjectComponent } from './select-project/select-project.component';
import { MatDialog } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class CasingProjectService {

  private readonly SELECTED_PROJECT_KEY = 'selectedProject';

  private selectedProject: SimplifiedProject;

  projectChanged$ = new Subject<SimplifiedProject>();

  constructor(private storageService: StorageService,
              private dialog: MatDialog) {
    this.getPersistedState();
  }

  private getPersistedState() {
    this.storageService.getOne(this.SELECTED_PROJECT_KEY).subscribe(selectedProject => {
      if (selectedProject) {
        this.selectedProject = new SimplifiedProject(JSON.parse(selectedProject));
      }
    });
  }

  getSelectedProject() {
    return this.selectedProject;
  }

  openProjectSelectionDialog(): void {
    const dialogRef = this.dialog.open(SelectProjectComponent, { maxWidth: '90%' });

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
      this.storageService.set(this.SELECTED_PROJECT_KEY, JSON.stringify(project)).subscribe();
    } else {
      this.storageService.removeOne(this.SELECTED_PROJECT_KEY).subscribe();
    }
    // If there was no previous project OR if the selected project is not the same as previous
    if (!prevProject || (this.selectedProject && prevProject.id !== this.selectedProject.id)) {
      this.projectChanged$.next(this.selectedProject);
    }
  }

}
