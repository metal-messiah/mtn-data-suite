import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../../shared/error-dialog/error-dialog.component';

@Component({
  selector: 'mds-area-calculator',
  templateUrl: './area-calculator.component.html',
  styleUrls: ['./area-calculator.component.css']
})
export class AreaCalculatorComponent implements OnInit {

  form: FormGroup;

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>,
              private fb: FormBuilder) {
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      ftPace: [null, [Validators.required, Validators.min(0)]],
      width: [null, [Validators.required, Validators.min(0)]],
      depth: [null, [Validators.required, Validators.min(0)]],
      plusMinus: null
    });
  }

  ngOnInit() {
  }

  getWidthFeet() {
    if (this.form.get('width').valid) {
      const ftPace = parseFloat(this.form.get('ftPace').value);
      return parseFloat(this.form.get('width').value) * ftPace;
    }
    return null;
  }

  getDepthFeet() {
    if (this.form.get('depth').valid) {
      const ftPace = parseFloat(this.form.get('ftPace').value);
      return parseFloat(this.form.get('depth').value) * ftPace;
    }
    return null;
  }

  getCalculatedArea() {
    if (this.form.valid) {
      const width = this.getWidthFeet();
      const depth = this.getDepthFeet();
      const plusMinus = parseInt(this.form.get('plusMinus').value, 10);
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
