import { Component, OnInit } from '@angular/core';
import { StoreCasingDetailService } from '../store-casing-detail.service';
import { StoreVolumesSelectionComponent } from '../../store-volumes-selection/store-volumes-selection.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';
import { StoreVolume } from '../../../models/full/store-volume';

@Component({
  selector: 'mds-casing-volume',
  templateUrl: './casing-volume.component.html',
  styleUrls: ['./casing-volume.component.css']
})
export class CasingVolumeComponent implements OnInit {

  readonly volumeTypeOptions = ['ACTUAL', 'ESTIMATE', 'PLACEHOLDER', 'PROJECTION', 'THIRD_PARTY'];
  readonly confidenceLevels = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];

  constructor(private service: StoreCasingDetailService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
  }

  get storeCasing() {
    return this.service.storeCasing;
  }

  get removingVolume() {
    return this.service.removingVolume;
  }

  get savingVolume() {
    return this.service.savingVolume;
  }

  get storeVolumeForm() {
    return this.service.storeVolumeForm;
  }

  removeVolume() {
    this.service.removeVolume();
  }

  showExistingVolumes() {
    const volumesDialog = this.dialog.open(StoreVolumesSelectionComponent, {
      data: {storeId: this.service.store.id},
      maxWidth: '90%'
    });
    volumesDialog.afterClosed().subscribe(result => {
      if (result != null && result !== '') {
        if (this.service.storeCasing.storeVolume) {
          const data = {
            title: 'Replace Volume',
            question: 'This will replace existing volume values. Are you sure?'
          };
          const confirmDialog = this.dialog.open(ConfirmDialogComponent, {data: data});
          confirmDialog.afterClosed().subscribe(confirmation => {
            if (confirmation) {
              this.service.copyIntoExistingVolume(result);
            }
          });
        } else {
          this.service.createNewVolumeCopy(result);
        }
      }
    });
  }

  calculateDepartmentVolumesFromTotal() {
    const totalVolumeControl = this.service.storeVolumeForm.get('volumeTotal');
    if (totalVolumeControl != null && totalVolumeControl.valid) {
      const totalVolume = parseFloat(totalVolumeControl.value);
      this.service.calculateDepartmentVolume(totalVolume, 'Meat');
      this.service.calculateDepartmentVolume(totalVolume, 'Produce');
      this.service.calculateDepartmentVolume(totalVolume, 'Grocery');
      this.service.calculateDepartmentVolume(totalVolume, 'NonFood');
      this.service.calculateDepartmentVolume(totalVolume, 'Other');
    }
  }

  calculateTotalVolumeFromDepartments() {
    const meatEstimate = this.service.getDeptEstimateOfTotal('Meat');
    const produceEstimate = this.service.getDeptEstimateOfTotal('Produce');
    const groceryEstimate = this.service.getDeptEstimateOfTotal('Grocery');
    const nonFoodEstimate = this.service.getDeptEstimateOfTotal('NonFood');
    const otherEstimate = this.service.getDeptEstimateOfTotal('Other');
    let sum = 0;
    let count = 0;
    if (meatEstimate != null) {
      sum += meatEstimate;
      count++;
    }
    if (produceEstimate != null) {
      sum += produceEstimate;
      count++;
    }
    if (groceryEstimate != null) {
      sum += groceryEstimate;
      count++;
    }
    if (nonFoodEstimate != null) {
      sum += nonFoodEstimate;
      count++;
    }
    if (otherEstimate != null) {
      sum += otherEstimate;
      count++;
    }
    if (count > 0) {
      const averageEstimate = sum / count;
      const roundedEstimate = Math.round(averageEstimate / 5000) * 5000;
      const totalVolumeControl = this.service.storeVolumeForm.get('volumeTotal');
      totalVolumeControl.setValue(roundedEstimate);
      totalVolumeControl.markAsDirty();
    }
  }

  createNewVolume() {
    this.service.setStoreVolume(new StoreVolume({
      volumeDate: new Date(),
      volumeType: 'ESTIMATE',
      source: 'MTN Casing App'
    }));
  }

}
