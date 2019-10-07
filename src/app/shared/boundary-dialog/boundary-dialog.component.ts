import { Component, Inject, OnInit } from '@angular/core';
import { BoundaryDialogService } from './boundary-dialog.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';

import { BoundaryColor } from './enums/boundary-color';
import { TextInputDialogComponent } from '../text-input-dialog/text-input-dialog.component';
import { BoundaryService } from 'app/core/services/boundary.service';
import { UserBoundaryService } from 'app/core/services/user-boundary.service';
import { UserBoundary } from 'app/models/full/user-boundary';

@Component({
  selector: 'mds-boundary-dialog',
  templateUrl: './boundary-dialog.component.html',
  styleUrls: ['./boundary-dialog.component.css']
})
export class BoundaryDialogComponent implements OnInit {
  boundaryColor = BoundaryColor;
  targetBoundary: UserBoundary;
  tabs = { PROJECT: 0, GEOPOLITICAL: 1, CUSTOM: 2 };

  constructor(
    private userBoundaryService: UserBoundaryService,
    private boundaryService: BoundaryService,
    private boundaryDialogService: BoundaryDialogService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<BoundaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.map) {
      this.boundaryDialogService.setMap(data.map);
      this.boundaryDialogService.fetchBoundaries();
    } else {
      console.error('NO MAP PROVIDED TO BOUNDARY DIALOG COMPONENT!');
    }
  }

  ngOnInit() {
    this.boundaryDialogService.drawEnabledBoundaries(); // refresh whats there;
  }

  getBoundaryColorCSS(idx: number) {
    return this.boundaryColor[Object.keys(this.boundaryColor)[idx]];
  }

  private setTargetBoundary(boundary, event) {
    this.targetBoundary = boundary;
    event.stopPropagation();
  }

  private editName() {
    this.dialog
      .open(TextInputDialogComponent, {
        data: {
          title: `Edit Name`,
          placeholder: this.targetBoundary.boundaryName
        }
      })
      .afterClosed()
      .subscribe((text: string) => {
        if (text) {
          this.userBoundaryService.getOneById(this.targetBoundary.id).subscribe((b: UserBoundary) => {
            b.boundaryName = text;
            this.userBoundaryService.update(b).subscribe(
              (newB: UserBoundary) => {
                this.targetBoundary.boundaryName = text;
              },
              err => console.error(err)
            );
          });
        }
      });
  }

  private editBoundary() {
    this.close(this.targetBoundary);
  }

  private deleteBoundary() {
    this.userBoundaryService.delete(this.targetBoundary.id).subscribe(() => {
      this.boundaryDialogService.customBoundaries = this.boundaryDialogService.customBoundaries.filter(
        cb => cb.id !== this.targetBoundary.id
      );
    });
  }

  private createNewBoundary() {
    this.dialog
      .open(TextInputDialogComponent, {
        data: {
          title: `Boundary Name`,
          placeholder: 'Enter Boundary Name'
        }
      })
      .afterClosed()
      .subscribe((text: string) => {
        if (text) {
          this.close(new UserBoundary({ boundaryName: text }));
        }
      });
  }

  private close(params: UserBoundary) {
    this.dialogRef.close(params);
  }

  get enabledProjectBoundaries() {
    return this.boundaryDialogService.enabledProjectBoundaries;
  }

  set enabledProjectBoundaries(data) {
    this.boundaryDialogService.setEnabledProjectBoundaries(data);
  }

  get enabledGeoPoliticalBoundaries() {
    return this.boundaryDialogService.enabledGeoPoliticalBoundaries;
  }

  set enabledGeoPoliticalBoundaries(data) {
    this.boundaryDialogService.setEnabledGeoPoliticalBoundaries(data);
  }

  get enabledCustomBoundaries() {
    return this.boundaryDialogService.enabledCustomBoundaries;
  }

  set enabledCustomBoundaries(data) {
    this.boundaryDialogService.setEnabledCustomBoundaries(data);
  }

  get projectBoundaries() {
    return this.boundaryDialogService.projectBoundaries;
  }

  get geoPoliticalBoundaries() {
    return this.boundaryDialogService.geoPoliticalBoundaries;
  }

  get customBoundaries() {
    return this.boundaryDialogService.customBoundaries;
  }
}
