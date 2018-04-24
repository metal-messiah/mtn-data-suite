import { Component, NgZone, OnInit } from '@angular/core';
import { Store } from '../../models/store';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { StoreService } from '../../core/services/store.service';

@Component({
  selector: 'mds-database-search',
  templateUrl: './database-search.component.html',
  styleUrls: ['./database-search.component.css']
})
export class DatabaseSearchComponent {

  stores: Store[];
  databaseSearchFormControl = new FormControl('');
  noSearchResults = false;

  constructor(public dialogRef: MatDialogRef<DatabaseSearchComponent>,
              private storeService: StoreService) { }

  closeDialog() {
    this.dialogRef.close();
  }

  search() {
    const queryString = this.databaseSearchFormControl.value;
    if (queryString != null) {
      this.storeService.getOneById(queryString).subscribe(store => {
        this.dialogRef.close(store);
      });
    }
  }

}
