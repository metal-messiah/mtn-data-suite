import { Component, OnInit } from '@angular/core';
import { TenantListDialogComponent } from '../../tenant-list-dialog/tenant-list-dialog.component';
import { StoreCasingDetailService } from '../store-casing-detail.service';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'mds-tenants',
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.css', '../casing-defaults.css']
})
export class TenantsComponent implements OnInit {

  constructor(private service: StoreCasingDetailService,
              private dialog: MatDialog) { }

  ngOnInit() {
  }

  get conditions() {
    return this.service.conditions;
  }

  get shoppingCenterSurveyForm() {
    return this.service.shoppingCenterSurveyForm;
  }

  get shoppingCenterCasingForm() {
    return this.service.shoppingCenterCasingForm;
  }

  openTenantDialog() {
    const vacantControl = this.service.shoppingCenterSurveyForm.get('tenantVacantCount');
    const data = {
      shoppingCenterSurveyId: this.service.shoppingCenterSurvey.id,
      vacantCount: vacantControl.value
    };

    const dialog = this.dialog.open(TenantListDialogComponent, {data: data, maxWidth: '90%', disableClose: true});
    dialog.afterClosed().subscribe((tenantCounts: { occupied: number, vacant: number }) => {
      if (tenantCounts.vacant !== vacantControl.value) {
        vacantControl.setValue(tenantCounts.vacant);
        vacantControl.markAsDirty();
      }
      const occupiedControl = this.service.shoppingCenterSurveyForm.get('tenantOccupiedCount');
      if (tenantCounts.occupied !== occupiedControl.value) {
        occupiedControl.setValue(tenantCounts.occupied);
        occupiedControl.markAsDirty();
      }
    });
  }

}
