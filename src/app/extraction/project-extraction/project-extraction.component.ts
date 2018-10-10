import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { SelectProjectComponent } from '../../casing/select-project/select-project.component';
import { MatDialog } from '@angular/material';
import { SimplifiedProject } from '../../models/simplified/simplified-project';
import { ExtractionService } from '../../core/services/extraction.service';
import { finalize } from 'rxjs/internal/operators';
import { ErrorService } from '../../core/services/error.service';
import { ExtractionFieldSetService } from '../../core/services/extraction-field-set.service';
import { ExtractionFieldSet } from '../../models/full/extraction-field-set';

@Component({
  selector: 'mds-project-extraction',
  templateUrl: './project-extraction.component.html',
  styleUrls: ['./project-extraction.component.css']
})
export class ProjectExtractionComponent implements OnInit {

  loading = false;
  downloading = false;
  selectedProject: SimplifiedProject;

  fieldSets: ExtractionFieldSet[];
  selectedFieldSet: ExtractionFieldSet;

  constructor(private extractionService: ExtractionService,
              private dialog: MatDialog,
              private _location: Location,
              private errorService: ErrorService,
              private extractionFieldSetService: ExtractionFieldSetService) {
  }

  ngOnInit() {
    this.loading = true;
    this.extractionFieldSetService.getAllFieldSets()
      .pipe(finalize(() => this.loading = false))
      .subscribe((fieldSets) => {
          this.fieldSets = fieldSets;
          this.selectedFieldSet = this.fieldSets[0];
        },
        err => this.errorService.handleServerError('Failed to retrieve field Sets!', err,
          () => this.goBack()));
  }

  goBack() {
    this._location.back();
  };

  openProjectSelectionDialog(): void {
    const dialogRef = this.dialog.open(SelectProjectComponent, {maxWidth: '90%'});

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'clear') {
        this.selectedProject = null;
      } else if (result != null) {
        this.selectedProject = result;
      }
    });
  }

  download() {
    this.downloading = true;
    this.extractionService.extractByProjectId(this.selectedProject.id, this.selectedFieldSet.id)
      .pipe(finalize(() => this.downloading = false))
      .subscribe((response) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = 'extraction.csv';
        a.target = '_blank';
        a.click();
        a.remove();
      }, err => this.errorService.handleServerError('Failed to download!', err,
        () => console.log(err),
        () => this.download()));
  }

}
