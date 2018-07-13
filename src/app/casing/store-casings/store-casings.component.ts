import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from '../../core/services/store.service';
import { SimplifiedStoreCasing } from '../../models/simplified/simplified-store-casing';
import { CasingDashboardService } from '../casing-dashboard/casing-dashboard.service';
import { StoreCasing } from '../../models/full/store-casing';
import { SimplifiedProject } from '../../models/simplified/simplified-project';
import { SelectProjectComponent } from '../select-project/select-project.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ErrorService } from '../../core/services/error.service';
import { StoreCasingService } from '../../core/services/store-casing.service';
import { CreateCasingDialogComponent } from '../create-casing-dialog/create-casing-dialog.component';
import { finalize } from 'rxjs/internal/operators';
import { Observable, of } from 'rxjs/index';

@Component({
  selector: 'mds-store-casings',
  templateUrl: './store-casings.component.html',
  styleUrls: ['./store-casings.component.css']
})
export class StoreCasingsComponent implements OnInit {

  storeId: number;
  loading = false;
  casings: SimplifiedStoreCasing[];

  constructor(private storeService: StoreService,
              private storeCasingService: StoreCasingService,
              private casingDashboardService: CasingDashboardService,
              private dialog: MatDialog,
              private errorService: ErrorService,
              private router: Router,
              private route: ActivatedRoute,
              private snackBar: MatSnackBar,
              private _location: Location) {
  }

  ngOnInit() {
    this.storeId = parseInt(this.route.snapshot.paramMap.get('storeId'), 10);
    this.loadCasings(this.storeId);
  }

  loadCasings(storeId: number) {
    this.loading = true;
    this.storeService.getCasingsByStoreId(this.storeId)
      .pipe(finalize(() => this.loading = false))
      .subscribe((casings: SimplifiedStoreCasing[]) => {
        this.casings = casings;
      }, err => this.errorService.handleServerError('Failed to retrieve Casings!', err,
        () => this.goBack(),
        () => this.loadCasings(storeId)));
  }

  createNewCasing() {
    const storeCasing: StoreCasing = new StoreCasing({
      casingDate: new Date()
    });
    this.getProject().subscribe((project: SimplifiedProject) => {
      if (project != null) {
        if (project.projectName != null) {
          storeCasing.projects = [project];
        }
        const dialogRef = this.dialog.open(CreateCasingDialogComponent);
        dialogRef.afterClosed().subscribe(result => {
          if (result != null) {
            this.saveNewCasing(storeCasing, result.storeRemodeled, result.shoppingCenterRedeveloped);
          }
        });
      }
    });
  }

  saveNewCasing(storeCasing: StoreCasing, storeRemodeled: boolean, shoppingCenterRedeveloped: boolean) {
    this.loading = true;
    this.storeService.createNewCasing(this.storeId, storeCasing, storeRemodeled, shoppingCenterRedeveloped)
      .pipe(finalize(() => this.loading = false))
      .subscribe((newStoreCasing: StoreCasing) => {
        this.router.navigate([newStoreCasing.id], {relativeTo: this.route});
      }, err => this.errorService.handleServerError('Failed to create new casing!', err,
        () => {
        },
        () => this.saveNewCasing(storeCasing, storeRemodeled, shoppingCenterRedeveloped)));
  }

  deleteCasing(storeCasing: SimplifiedStoreCasing, index) {
    this.loading = true;
    this.storeCasingService.delete(storeCasing.id)
      .pipe(finalize(() => this.loading = false))
      .subscribe(() => {
        this.casings.splice(index, 1);
        this.snackBar.open('Successfully deleted casing.', null, {duration: 1000});
      });
  }

  canEditCasing(casing: SimplifiedStoreCasing) {
    if (casing.projects == null || casing.projects.length === 0) {
      return true;
    }
    const selectedProject = this.casingDashboardService.getSelectedProject();
    if (selectedProject != null) {
      for (const project of casing.projects) {
        if (project.id === selectedProject.id) {
          return true;
        }
      }
    }
    return false;
  }

  private getProject(): Observable<SimplifiedProject> {
    if (this.casingDashboardService.getSelectedProject() != null) {
      return of(this.casingDashboardService.getSelectedProject());
    } else {
      const dialogRef = this.dialog.open(SelectProjectComponent);
      return dialogRef.afterClosed();
    }
  }

  goBack() {
    this._location.back();
  };

}
