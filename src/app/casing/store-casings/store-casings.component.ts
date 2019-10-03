import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from '../../core/services/store.service';
import { SimplifiedStoreCasing } from '../../models/simplified/simplified-store-casing';
import { StoreCasing } from '../../models/full/store-casing';
import { SimplifiedProject } from '../../models/simplified/simplified-project';
import { SelectProjectComponent } from '../select-project/select-project.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorService } from '../../core/services/error.service';
import { StoreCasingService } from '../../core/services/store-casing.service';
import { finalize, tap } from 'rxjs/internal/operators';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { Store } from '../../models/full/store';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { CasingProjectService } from '../casing-project.service';

@Component({
  selector: 'mds-store-casings',
  templateUrl: './store-casings.component.html',
  styleUrls: ['./store-casings.component.css', '../entity-detail-view.css']
})
export class StoreCasingsComponent implements OnInit, OnDestroy {

  loading = false;

  store: Store;
  casings: SimplifiedStoreCasing[];

  layoutIsSmall = false;
  private subscriptions: Subscription[] = [];

  constructor(private storeService: StoreService,
              private casingProjectService: CasingProjectService,
              private storeCasingService: StoreCasingService,
              private dialog: MatDialog,
              private errorService: ErrorService,
              private router: Router,
              private route: ActivatedRoute,
              private snackBar: MatSnackBar,
              private breakpointObserver: BreakpointObserver,
              private _location: Location) {
  }

  ngOnInit() {
    const storeIdParam = this.route.snapshot.paramMap.get('storeId');
    const storeId = parseInt(storeIdParam, 10);
    if (!storeIdParam || isNaN(storeId)) {
      this.errorService.handleServerError('Invalid siteId param!', {}, () => this._location.back());
    } else {
      this.loadData(storeId);
    }

    this.subscriptions.push(this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.HandsetPortrait])
      .subscribe((state: BreakpointState) => this.layoutIsSmall = state.matches));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getSelectedProject() {
    return this.casingProjectService.getSelectedProject();
  }

  openProjectSelectionDialog() {
    this.casingProjectService.openProjectSelectionDialog();
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
        this.saveNewCasing(storeCasing);
      }
    });
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
    const selectedProject = this.casingProjectService.getSelectedProject();
    if (selectedProject) {
      return casing.projects.some(project => project.id === selectedProject.id);
    }
    return false;
  }

  private loadData(storeId) {
    const getStore = this.storeService.getOneById(storeId)
      .pipe(tap((store: Store) => this.store = store));
    const getCasings = this.storeService.getCasingsByStoreId(storeId)
      .pipe(tap((casings: SimplifiedStoreCasing[]) => this.casings = casings));

    this.loading = true;
    forkJoin([getStore, getCasings])
      .pipe(finalize(() => this.loading = false))
      .subscribe(results => {
        console.log(results);
      }, err => this.errorService.handleServerError('Failed to retrieve data!', err,
        () => this._location.back(),
        () => this.loadData(storeId)));
  }

  private saveNewCasing(storeCasing: StoreCasing) {
    this.loading = true;
    this.storeService.createNewCasing(this.store.id, storeCasing)
      .pipe(finalize(() => this.loading = false))
      .subscribe((newStoreCasing: StoreCasing) => {
        this.router.navigate([newStoreCasing.id], {relativeTo: this.route});
      }, err => this.errorService.handleServerError('Failed to create new casing!', err,
        () => console.log(err),
        () => this.saveNewCasing(storeCasing)));
  }


  private getProject(): Observable<SimplifiedProject> {
    if (this.casingProjectService.getSelectedProject() != null) {
      return of(this.casingProjectService.getSelectedProject());
    } else {
      const dialogRef = this.dialog.open(SelectProjectComponent, {maxWidth: '90%'});
      return dialogRef.afterClosed();
    }
  }

}
