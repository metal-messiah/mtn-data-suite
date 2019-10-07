import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StorageService } from 'app/core/services/storage.service';
import { ControlStorageKeys, Control } from 'app/models/control';

@Component({
  selector: 'mds-stored-controls-selection-dialog',
  templateUrl: './stored-controls-selection-dialog.component.html',
  styleUrls: ['./stored-controls-selection-dialog.component.css']
})
export class StoredControlsSelectionDialogComponent {

  originalSavedControlsObject;
  controls: Control[] = [];

  constructor(public dialogRef: MatDialogRef<StoredControlsSelectionDialogComponent>,
    private storageService: StorageService,
    @Inject(MAT_DIALOG_DATA) public data: { controls: any }) {
    this.storageService.getOne(ControlStorageKeys.savedDbEntityMarkerServiceControls).subscribe((savedControls) => {
      this.originalSavedControlsObject = savedControls;
      this.setControlItems(this.originalSavedControlsObject);
    });
  }

  setControlItems(savedControls) {
    this.controls = Object.keys(savedControls).map((k => savedControls[k]));
  }

  delete(control: Control) {
    delete this.originalSavedControlsObject[control.name];
    this.storageService.set(ControlStorageKeys.savedDbEntityMarkerServiceControls, this.originalSavedControlsObject).subscribe();
    this.setControlItems(this.originalSavedControlsObject);
  }

  submit(control: Control) {
    this.dialogRef.close(control);
  }

}
