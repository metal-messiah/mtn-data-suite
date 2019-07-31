import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { StoreService } from '../../core/services/store.service';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'mds-database-search',
  templateUrl: './database-search.component.html',
  styleUrls: ['./database-search.component.css']
})
export class DatabaseSearchComponent {

  constructor(private dialogRef: MatDialogRef<DatabaseSearchComponent>,
              private errorService: ErrorService,
              private storeService: StoreService) { }

  search(queryString: string) {
    if (queryString != null) {
      this.storeService.getOneById(queryString).subscribe(store => {
        this.dialogRef.close(store);
      }, err => this.errorService.handleServerError('Failed to find store!', err,
        () => console.error(err)));
    }
  }

}
