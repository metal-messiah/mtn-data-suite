import { Component, Inject, OnInit } from '@angular/core';
import { ProjectSummary } from '../../models/simplified/project-summary';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ProjectService } from '../../core/services/project.service';
import { ErrorService } from '../../core/services/error.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'mds-project-summary',
  templateUrl: './project-summary.component.html',
  styleUrls: ['./project-summary.component.css']
})
export class ProjectSummaryComponent implements OnInit {

  project;
  projectSummaryObs: Observable<ProjectSummary>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<ProjectSummaryComponent>,
              private errorService: ErrorService,
              private projectService: ProjectService) {
  }

  ngOnInit() {
    this.project = this.data.project;
    this.projectSummaryObs = this.projectService.getProjectSummary(this.project.id)
      .pipe(catchError(err => {
        this.errorService.handleServerError('Failed to get project summary!', err, () => console.error(err));
        this.dialogRef.close();
        return of(err);
      }));
  }

}
