import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Project } from '../../models/full/project';
import { finalize } from 'rxjs/internal/operators';
import { ProjectService } from '../../core/services/project.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'mds-new-project-name',
  templateUrl: './new-project-name.component.html',
  styleUrls: ['./new-project-name.component.css']
})
export class NewProjectNameComponent implements OnInit {

  projectName: FormControl;
  saving = false;

  constructor(public dialogRef: MatDialogRef<NewProjectNameComponent>,
              private projectService: ProjectService,
              private errorService: ErrorService,
              private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.projectName = new FormControl('', [Validators.required]);
  }

  create() {
    this.saving = true;
    const newProject = new Project({
      projectName: this.projectName.value,
      active: true,
      primaryData: true,
      source: 'MTN Casing App',
      dateStarted: new Date()
    });
    this.projectService.create(newProject)
      .pipe(finalize(() => this.saving = false))
      .subscribe(project => {
        this.snackBar.open('Successfully created new Project', null, {duration: 1000});
        this.dialogRef.close(project);
      }, err => this.errorService.handleServerError('Failed to create new project!', err,
        () => console.log(err), () => this.create()));
  }

}
