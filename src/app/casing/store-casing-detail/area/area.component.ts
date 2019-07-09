import { Component, OnInit } from '@angular/core';
import { StoreCasingDetailService } from '../store-casing-detail.service';
import { AreaCalculatorComponent } from '../../area-calculator/area-calculator.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'mds-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.css']
})
export class AreaComponent implements OnInit {

  constructor(private service: StoreCasingDetailService,
              private dialog: MatDialog) { }

  ngOnInit() {
  }

  get storeForm() {
    return this.service.storeForm;
  }

  openAreaCalculator() {
    const dialogRef = this.dialog.open(AreaCalculatorComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        if (result.salesArea != null) {
          const control = this.service.storeForm.get('areaSales');
          control.setValue(result.salesArea);
          control.markAsDirty();
        } else if (result.totalArea != null) {
          const control = this.service.storeForm.get('areaTotal');
          control.setValue(result.totalArea);
          control.markAsDirty();
        }
      }
    });
  }

}
