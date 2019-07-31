import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'mds-group-selection',
  templateUrl: './item-selection-dialog.component.html',
  styleUrls: ['./item-selection-dialog.component.css']
})
export class ItemSelectionDialogComponent implements OnInit {

  prompt: string;
  items: any[];

  loading = false;

  constructor(private dialogRef: MatDialogRef<ItemSelectionDialogComponent>,
              private errorService: ErrorService,
              @Inject(MAT_DIALOG_DATA) private data: { items: any[], prompt: string, getDisplayText: (item) => string }) {
  }

  ngOnInit() {
    this.prompt = this.data.prompt;
    this.items = this.data.items;
  }

  select(item: { id: number }) {
    this.dialogRef.close({itemId: item ? item.id : null});
  }

  getItemDisplayText(item: any) {
    return this.data.getDisplayText(item);
  }

}
