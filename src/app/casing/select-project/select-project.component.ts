import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../models/project';
import { Pageable } from '../../models/pageable';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'mds-select-project',
  templateUrl: './select-project.component.html',
  styleUrls: ['./select-project.component.css']
})
export class SelectProjectComponent implements OnInit {

  projects: Project[] = [];
  totalPages = 0;
  pageNumber = 0;
  projectQuery: string;
  active = true;
  primaryData = true;

  @ViewChild('projectSearchBox') projectSearchBoxElement: ElementRef;

  constructor(public dialogRef: MatDialogRef<SelectProjectComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private projectService: ProjectService) {
  }

  ngOnInit() {
    this.getProjects();

    const typeAhead = fromEvent(this.projectSearchBoxElement.nativeElement, 'input').pipe(
      map((e: KeyboardEvent) => e.target['value']),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value: any, index: number) => this.projectService.getAll(value, this.active, this.primaryData))
    );

    typeAhead.subscribe((pageable: Pageable<Project>) => this.update(pageable));
  }

  loadMore(): void {
    this.projectService.getAll(this.projectQuery, this.active, this.primaryData, ++this.pageNumber)
      .subscribe((pageable: Pageable<Project>) => {
        this.projects = this.projects.concat(pageable.content);
        this.totalPages = pageable.totalPages;
        this.pageNumber = pageable.number;
      });
  }

  getProjects(): void {
    this.projectService.getAll(this.projectQuery, this.active, this.primaryData)
      .subscribe(
        (pageable: Pageable<Project>) => {
          this.update(pageable);
        },
        err => console.log(err)
      );
  }

  private update(pageable: Pageable<Project>) {
    this.projects = pageable.content;
    this.totalPages = pageable.totalPages;
    this.pageNumber = pageable.number;
  }

  selectProject(project: Project): void {
    this.dialogRef.close(project);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  clearSelectedProject(): void {
    this.dialogRef.close('clear');
  }
}
