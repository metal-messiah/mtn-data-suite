import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorService } from '../../core/services/error.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { RoutingStateService } from '../../core/services/routing-state.service';
import { finalize, tap } from 'rxjs/internal/operators';
import { Observable } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Project } from '../../models/full/project';
import { ProjectService } from '../../core/services/project.service';

@Component({
  selector: 'mds-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css', '../entity-detail-view.css']
})
export class ProjectDetailComponent implements OnInit {

  loading = false;
  saving = false;

  project: Project;

  form: FormGroup;

  months = [
    {name: 'Jan', value: 1},
    {name: 'Feb', value: 2},
    {name: 'Mar', value: 3},
    {name: 'Apr', value: 4},
    {name: 'May', value: 5},
    {name: 'Jun', value: 6},
    {name: 'Jul', value: 7},
    {name: 'Aug', value: 8},
    {name: 'Sep', value: 9},
    {name: 'Oct', value: 10},
    {name: 'Nov', value: 11},
    {name: 'Dec', value: 12},
  ];

  constructor(private projectService: ProjectService,
              private router: Router,
              private route: ActivatedRoute,
              private routingState: RoutingStateService,
              private errorService: ErrorService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private _location: Location,
              private fb: FormBuilder) {
    this.createForm();
  }

  private createForm() {
    this.form = this.fb.group({
      projectName: '',
      metroArea: '',
      clientName: '',
      projectYear: ['', [Validators.min(1900), Validators.max(3000)]],
      projectMonth: ['', [Validators.min(1), Validators.max(12)]],
      active: false,
      primaryData: false,
      dateStarted: '',
      dateCompleted: '',
      source: '',
      legacyProjectId: ''
    });
  }

  ngOnInit() {
    this.loadProject();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadProject();
      }
    });
  }

  private loadProject() {
    const projectId = parseInt(this.route.snapshot.paramMap.get('projectId'), 10);
    this.loading = true;
    this.projectService.getOneById(projectId)
      .pipe(finalize(() => this.loading = false))
      .subscribe((project: Project) => {
          this.project = project;
          this.rebuildForm();
        },
        err => this.errorService.handleServerError('Failed to load Project!', err,
          () => this._location.back(),
          () => this.loadProject())
      );
  }

  private rebuildForm() {
    this.form.reset(this.project);
  }

  private prepareSaveProject(): Project {
    const savable = Object.assign({}, this.project);
    Object.keys(this.form.controls).forEach(key => {
      if (this.form.get(key).dirty) {
        savable[key] = this.form.get(key).value;
      }
    });

    return savable;
  }

  saveForm() {
    this.saving = true;
    this.projectService.update(this.prepareSaveProject())
      .pipe(finalize(() => this.saving = false))
      .subscribe((project: Project) => {
        this.form.reset(project);
        this.snackBar.open(`Successfully updated Project`, null, {duration: 1000});
        this._location.back();
      }, err => this.errorService.handleServerError('Failed to update Project!', err,
        () => console.log('Cancelled'),
        () => this.saveForm()));
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.form.pristine) {
      return true;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {title: 'Warning!', question: 'Are you sure you wish to abandon unsaved changes?'}
    });
    return dialogRef.afterClosed().pipe(tap(result => {
      // Corrects for a bug between the router and CanDeactivateGuard that pops the state even if user says no
      if (!result) {
        history.pushState({}, 'project', this.routingState.getPreviousUrl());
      }
    }));
  }

}
