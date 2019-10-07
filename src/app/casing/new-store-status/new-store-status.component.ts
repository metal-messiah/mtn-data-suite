import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs/internal/operators';
import { StoreStatus } from '../../models/full/store-status';
import { Store } from '../../models/full/store';
import { StoreService } from '../../core/services/store.service';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'mds-new-store-status',
  templateUrl: './new-store-status.component.html',
  styleUrls: ['./new-store-status.component.css']
})
export class NewStoreStatusComponent implements OnInit {

  form: FormGroup;

  creating = false;

  storeStatusOptions = [
    'Closed',
    'Dead Deal',
    'New Under Construction',
    'Open',
    'Planned',
    'Proposed',
    'Remodel',
    'Rumored',
    'Strong Rumor',
    'Temporarily Closed'
  ];

  constructor(private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: { storeId: number },
              private dialogRef: MatDialogRef<NewStoreStatusComponent>,
              private errorService: ErrorService,
              private storeService: StoreService) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      status: 'Open',
      statusStartDate: new Date()
    });
  }

  create() {
    const date: Date = this.form.get('statusStartDate').value;
    const storeStatus = new StoreStatus({
      status: this.form.get('status').value,
      statusStartDate: new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
    });
    this.creating = true;
    this.storeService.createNewStatus(this.data.storeId, storeStatus)
      .pipe(finalize(() => this.creating = false))
      .subscribe((store: Store) => this.dialogRef.close(store),
          err => this.errorService.handleServerError('Failed to add create Status', err,
            () => {},
            () => this.create())
      );
  }

}
