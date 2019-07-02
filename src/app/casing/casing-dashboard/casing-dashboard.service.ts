import { Injectable } from '@angular/core';
import { SelectProjectComponent } from '../select-project/select-project.component';
import { MatDialog } from '@angular/material/dialog';
import { SimplifiedProject } from '../../models/simplified/simplified-project';
import { Subject } from 'rxjs';
import { CasingDashboardMode } from '../enums/casing-dashboard-mode';
import { StorageService } from '../../core/services/storage.service';

@Injectable()
export class CasingDashboardService {

  private readonly SELECTED_PROJECT_KEY = 'selectedProject';
  private readonly STORE_LIST_STORAGE_KEY = 'showStoreLists';

  // StoreList sidenav control
  private _showingStoreListSidenav = false;

  private selectedProject: SimplifiedProject;

  selectedDashboardMode = CasingDashboardMode.DEFAULT;

  projectChanged$ = new Subject<SimplifiedProject>();

  constructor(private dialog: MatDialog,
              private storageService: StorageService) {
    this.getPersistedState();
  }

  private getPersistedState() {
    this.storageService.getOne(this.SELECTED_PROJECT_KEY).subscribe(selectedProject => {
      if (selectedProject) {
        this.selectedProject = new SimplifiedProject(JSON.parse(selectedProject));
      }
    });

    this.storageService.getOne(this.STORE_LIST_STORAGE_KEY).subscribe(shouldShow => {
      // Set if true (default is false)
      if (shouldShow) {
        this.setShowingStoreListSidenav(true);
      }
    });
  }

  setShowingStoreListSidenav(show: boolean) {
    this._showingStoreListSidenav = show;
    // Save the state
    this.storageService.set(this.STORE_LIST_STORAGE_KEY, this._showingStoreListSidenav).subscribe()
  }

  get showingStoreListSidenav() {
    return this._showingStoreListSidenav;
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

  getSelectedProject() {
    return this.selectedProject;
  }

}
