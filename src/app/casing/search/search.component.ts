import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'mds-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {

  constructor(public dialogRef: MatDialogRef<SearchComponent>) { }

  closeDialog() {
    this.dialogRef.close();
  }

}
