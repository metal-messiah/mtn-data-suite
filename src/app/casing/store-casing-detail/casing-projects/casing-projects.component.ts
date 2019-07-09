import { Component, OnInit } from '@angular/core';
import { SelectProjectComponent } from '../../select-project/select-project.component';
import { SimplifiedProject } from '../../../models/simplified/simplified-project';
import { CasingDashboardService } from '../../casing-dashboard/casing-dashboard.service';
import { StoreCasingDetailService } from '../store-casing-detail.service';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'mds-casing-projects',
  templateUrl: './casing-projects.component.html',
  styleUrls: ['./casing-projects.component.css']
})
export class CasingProjectsComponent implements OnInit {

  constructor(private casingDashboardService: CasingDashboardService,
              private service: StoreCasingDetailService,
              private dialog: MatDialog) { }

  ngOnInit() {
  }

  get storeCasing() {
    return this.service.storeCasing;
  }

  showProjectSelection() {
    const dialogRef = this.dialog.open(SelectProjectComponent, {maxWidth: '90%'});

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'clear') {
        console.log('Project Selection Dialog Closed');
      } else if (result != null) {
        this.service.addProject(result);
      }
    });
  }

  removeProject(project: SimplifiedProject) {
    this.service.removeProject(project);
  }

}
