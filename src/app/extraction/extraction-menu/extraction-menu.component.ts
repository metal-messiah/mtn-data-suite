import { Component, OnInit } from '@angular/core';
import { SelectProjectComponent } from '../../casing/select-project/select-project.component';
import { SimplifiedProject } from '../../models/simplified/simplified-project';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'mds-extraction-menu',
  templateUrl: './extraction-menu.component.html',
  styleUrls: ['./extraction-menu.component.css']
})
export class ExtractionMenuComponent implements OnInit {

  selectedProject: SimplifiedProject;

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }

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

}
