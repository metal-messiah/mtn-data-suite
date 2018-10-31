import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { JsonToTablesUtil } from '../report-tables/json-to-tables.util';
import { StoreListItem } from '../../models/store-list-item';

@Component({
  selector: 'mds-edit-total-size-dialog',
  templateUrl: './edit-total-size-dialog.component.html',
  styleUrls: ['./edit-total-size-dialog.component.css'],
})
export class EditTotalSizeDialogComponent implements OnInit {
  title = 'Update Total Size';
  value: number;
  store: StoreListItem;
  jsonToTablesService: JsonToTablesUtil;

  MatDialog;
  constructor(
    public dialogRef: MatDialogRef<EditTotalSizeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(data);
    this.value = Number(data.value.replace(/,/g, ''));
    this.store = data.store;
    this.jsonToTablesService = data.jsonToTablesService
  }

  ngOnInit() {}

  changeValue(val) {
    console.log(val);
    this.value = val;
  }

  updateAll(form) {
    if (form.valid) {
      // TODO
    // this.jsonToTablesService.updateSOVTotalSize(this.store, this.value);
    this.dialogRef.close();
    }
  }
}
