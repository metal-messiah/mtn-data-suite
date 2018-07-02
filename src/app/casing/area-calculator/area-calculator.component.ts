import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { ErrorDialogComponent } from '../../shared/error-dialog/error-dialog.component';

@Component({
  selector: 'mds-area-calculator',
  templateUrl: './area-calculator.component.html',
  styleUrls: ['./area-calculator.component.css']
})
export class AreaCalculatorComponent implements OnInit {

  width: FormControl;
  depth: FormControl;
  plusMinus: FormControl;

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>) {
    this.createForm();
  }

  createForm() {
    this.width = new FormControl('', [Validators.required, Validators.min(0)]);
    this.depth = new FormControl('', [Validators.required, Validators.min(0)]);
    this.plusMinus = new FormControl('');
  }

  ngOnInit() {
  }

  getCalculatedArea() {
    if (this.width.valid && this.depth.valid && this.plusMinus.valid) {
      const width = parseInt(this.width.value, 10);
      const depth = parseInt(this.depth.value, 10);
      const plusMinus = parseInt(this.plusMinus.value, 10);
      if (!isNaN(width) && !isNaN(depth)) {
        let calculatedArea = width * depth;
        if (!isNaN(plusMinus)) {
          calculatedArea += plusMinus;
        }
        return calculatedArea;
      }
    }
    return null;
  }

  close() {
    this.dialogRef.close();
  }

  setAsSalesArea() {
    this.dialogRef.close({salesArea: this.getCalculatedArea()});
  }

  setAsTotalArea() {
    this.dialogRef.close({totalArea: this.getCalculatedArea()});
  }
}
