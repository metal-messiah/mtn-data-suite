import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { StoreCasingService } from '../../core/services/store-casing.service';
import { StoreCasing } from '../../models/store-casing';
import { StoreStatus } from '../../models/store-status';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StoreVolume } from '../../models/store-volume';
import { StoreService } from '../../core/services/store.service';
import { SimplifiedStoreVolume } from '../../models/simplified-store-volume';
import { ErrorService } from '../../core/services/error.service';
import { SelectProjectComponent } from '../select-project/select-project.component';
import { MatDialog } from '@angular/material';
import { SimplifiedProject } from '../../models/simplified-project';
import { StoreStatusesDialogComponent } from '../store-statuses-dialog/store-statuses-dialog.component';
import { Store } from '../../models/store';
import { SimplifiedStoreStatus } from '../../models/simplified-store-status';
import { DataFieldInfoDialogComponent } from '../../shared/data-field-info-dialog/data-field-info-dialog.component';
import { CasingDashboardService } from '../casing-dashboard/casing-dashboard.service';
import { Project } from '../../models/project';
import { AreaCalculatorComponent } from '../area-calculator/area-calculator.component';
import { StoreVolumesSelectionComponent } from '../store-volumes-selection/store-volumes-selection.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'mds-store-casing-detail',
  templateUrl: './store-casing-detail.component.html',
  styleUrls: ['./store-casing-detail.component.css']
})
export class StoreCasingDetailComponent implements OnInit {

  casingForm: FormGroup;
  storeVolumeForm: FormGroup;
  storeSurveyForm: FormGroup;

  casing: StoreCasing;

  loading = false;
  savingVolume = false;
  removingVolume = false;
  loadingProject = false;
  editingStoreStatus = false;

  conditions = ['POOR', 'FAIR', 'AVERAGE', 'GOOD', 'EXCELLENT'];
  confidenceLevels = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
  volumeTypeOptions = ['ACTUAL', 'ESTIMATE', 'PLACEHOLDER', 'PROJECTION', 'THIRD_PARTY'];
  fitOptions = ['Aldi', 'Asian', 'Club', 'Conventional', 'Discount', 'Hispanic', 'Natural Foods', 'Quality/Service',
    'Save A Lot', 'Sprouts', 'Supercenter', 'Trader Joe\'s', 'Warehouse', 'Whole Foods'];
  formatOptions = ['Asian', 'Club', 'Combo', 'Conventional', 'Conventional Mass Merchandiser', 'Discount', 'Ethnic',
    'Food/Drug Combo', 'Hispanic', 'Independent', 'International', 'Limited Assortment', 'Natural Foods',
    'Natural/Gourmet Foods', 'Super Combo', 'Supercenter', 'Superette/Small Grocery', 'Supermarket', 'Superstore',
    'Trader Joe\'s', 'Warehouse'];

  departmentControls = [
    {name: 'departmentBakery', title: 'Bakery', info: 'Service Bakery will usually have x'},
    {name: 'departmentBank', title: 'Bank', info: 'Customers must be able to access the bank from within the store'},
    {name: 'departmentBeer', title: 'Beer', info: 'Sells Beer'},
    {name: 'departmentBulk', title: 'Bulk', info: 'Sells food in bulk'},
    {name: 'departmentCheese', title: 'Cheese', info: 'Service Cheese will usually have x'},
    {name: 'departmentCoffee', title: 'Coffee', info: '???'},
    {name: 'departmentDeli', title: 'Deli', info: '???'},
    {name: 'departmentExpandedGm', title: 'ExpandedGm', info: '???'},
    {name: 'departmentExtensivePreparedFoods', title: 'ExtensivePreparedFoods', info: '???'},
    {name: 'departmentFloral', title: 'Floral', info: '???'},
    {name: 'departmentFuel', title: 'Fuel', info: '???'},
    {name: 'departmentHotBar', title: 'HotBar', info: '???'},
    {name: 'departmentInStoreRestaurant', title: 'InStoreRestaurant', info: '???'},
    {name: 'departmentLiquor', title: 'Liquor', info: '???'},
    {name: 'departmentMeat', title: 'Meat', info: '???'},
    {name: 'departmentNatural', title: 'Natural', info: '???'},
    {name: 'departmentOliveBar', title: 'OliveBar', info: '???'},
    {name: 'departmentOnlinePickup', title: 'OnlinePickup', info: '???'},
    {name: 'departmentPharmacy', title: 'Pharmacy', info: '???'},
    {name: 'departmentPreparedFoods', title: 'PreparedFoods', info: '???'},
    {name: 'departmentSaladBar', title: 'SaladBar', info: '???'},
    {name: 'departmentSeafood', title: 'Seafood', info: '???'},
    {name: 'departmentSeating', title: 'Seating', info: '???'},
    {name: 'departmentSushi', title: 'Sushi', info: '???'},
    {name: 'departmentWine', title: 'Wine', info: '???'}
  ];

  constructor(private storeCasingService: StoreCasingService,
              private storeService: StoreService,
              private route: ActivatedRoute,
              private _location: Location,
              private dialog: MatDialog,
              private errorService: ErrorService,
              public casingDashboardService: CasingDashboardService,
              private fb: FormBuilder) {
    this.createForm();
  }

  createForm() {
    this.casingForm = this.fb.group({
      casingDate: [new Date(), [Validators.required]],
      note: '',
      conditionCeiling: '',
      conditionCheckstands: '',
      conditionFloors: '',
      conditionFrozenRefrigerated: '',
      conditionShelvingGondolas: '',
      conditionWalls: '',
      fuelGallonsWeekly: ['', [Validators.min(0)]],
      pharmacyScriptsWeekly: ['', [Validators.min(0)]],
      pharmacyAvgDollarsPerScript: ['', [Validators.min(0)]],
      pharmacyPharmacistCount: ['', [Validators.min(0)]],
      pharmacyTechnicianCount: ['', [Validators.min(0)]],
    });

    this.storeVolumeForm = this.fb.group({
      volumeTotal: ['', [Validators.min(1000), Validators.max(10000000)]],
      volumeDate: new Date(),
      volumeType: ['', [Validators.required]],
      volumeGrocery: ['', [Validators.min(0), Validators.max(10000000)]],
      volumePercentGrocery: ['', [Validators.min(0), Validators.max(100)]],
      volumeMeat: ['', [Validators.min(0), Validators.max(10000000)]],
      volumePercentMeat: ['', [Validators.min(0), Validators.max(100)]],
      volumeNonFood: ['', [Validators.min(0), Validators.max(10000000)]],
      volumePercentNonFood: ['', [Validators.min(0), Validators.max(100)]],
      volumeOther: ['', [Validators.min(0), Validators.max(10000000)]],
      volumePercentOther: ['', [Validators.min(0), Validators.max(100)]],
      volumeProduce: ['', [Validators.min(0), Validators.max(10000000)]],
      volumePercentProduce: ['', [Validators.min(0), Validators.max(100)]],
      volumeNote: '',
      volumeConfidence: ''
    });

    this.storeSurveyForm = this.fb.group({
      surveyDate: [new Date(), [Validators.required]],
      note: '',
      fit: '',
      format: '',
      areaSales: '',
      areaSalesPercentOfTotal: ['', [Validators.min(0.01), Validators.max(100)]],
      areaTotal: '',
      areaIsEstimate: '',
      naturalFoodsAreIntegrated: '',
      storeIsOpen24: '',
      registerCountNormal: '',
      registerCountExpress: '',
      registerCountSelfCheckout: '',
      fuelDispenserCount: '',
      fuelIsOpen24: '',
      pharmacyIsOpen24: '',
      pharmacyHasDriveThrough: '',
      departmentBakery: '',
      departmentBank: '',
      departmentBeer: '',
      departmentBulk: '',
      departmentCheese: '',
      departmentCoffee: '',
      departmentDeli: '',
      departmentExpandedGm: '',
      departmentExtensivePreparedFoods: '',
      departmentFloral: '',
      departmentFuel: '',
      departmentHotBar: '',
      departmentInStoreRestaurant: '',
      departmentLiquor: '',
      departmentMeat: '',
      departmentNatural: '',
      departmentOliveBar: '',
      departmentOnlinePickup: '',
      departmentPharmacy: '',
      departmentPreparedFoods: '',
      departmentSaladBar: '',
      departmentSeafood: '',
      departmentSeating: '',
      departmentSushi: '',
      departmentWine: '',
      accessibilityFarthestFromEntrance: '',
      accessibilityMainIntersectionHasTrafficLight: '',
      accessibilityMainIntersectionNeedsTrafficLight: '',
      accessibilityMultipleRetailersBeforeSite: '',
      accessibilitySetBackTwiceParkingLength: '',
      accessibilityRating: '',
      parkingOutparcelsInterfereWithParking: '',
      parkingDirectAccessToParking: '',
      parkingSmallParkingField: '',
      parkingHasTSpaces: '',
      parkingRating: '',
      visibilityHillDepressionBlocksView: '',
      visibilityOutparcelsBlockView: '',
      visibilitySignOnMain: '',
      visibilityStoreFacesMainRoad: '',
      visibilityTreesBlockView: '',
      visibilityRating: '',
      seasonalityJan: ['', [Validators.min(-100), Validators.max(200)]],
      seasonalityFeb: ['', [Validators.min(-100), Validators.max(200)]],
      seasonalityMar: ['', [Validators.min(-100), Validators.max(200)]],
      seasonalityApr: ['', [Validators.min(-100), Validators.max(200)]],
      seasonalityMay: ['', [Validators.min(-100), Validators.max(200)]],
      seasonalityJun: ['', [Validators.min(-100), Validators.max(200)]],
      seasonalityJul: ['', [Validators.min(-100), Validators.max(200)]],
      seasonalityAug: ['', [Validators.min(-100), Validators.max(200)]],
      seasonalitySep: ['', [Validators.min(-100), Validators.max(200)]],
      seasonalityOct: ['', [Validators.min(-100), Validators.max(200)]],
      seasonalityNov: ['', [Validators.min(-100), Validators.max(200)]],
      seasonalityDec: ['', [Validators.min(-100), Validators.max(200)]]
    });
  }

  ngOnInit() {
    if (this.route.snapshot.paramMap.has('storeCasingId')) {
      this.loading = true;
      const storeCasingId = parseInt(this.route.snapshot.paramMap.get('storeCasingId'), 10);
      this.storeCasingService.getOneById(storeCasingId)
        .finally(() => this.loading = false)
        .subscribe((casing: StoreCasing) => {
          this.casing = casing;
          console.log(this.casing);
          this.rebuildForm();
        });
    } else {
      this.casing = new StoreCasing({
        casingDate: new Date()
      });
      console.log(this.casing);
      this.rebuildForm();
    }
  }

  rebuildForm(doPreserveChanges?: boolean) {
    const preserveChanges = {};
    if (doPreserveChanges) {
      Object.keys(this.casingForm.controls).forEach(name => {
        const control = this.casingForm.controls[name];
        if (control.dirty) {
          preserveChanges[name] = control.value;
        }
      });
    }
    if (this.casing.storeVolume != null) {
      this.casingForm.addControl('storeVolume', this.storeVolumeForm);
    } else {
      this.casingForm.removeControl('storeVolume');
    }
    if (this.casing.storeSurvey != null) {
      this.casingForm.addControl('storeSurvey', this.storeSurveyForm);
    } else {
      this.casingForm.removeControl('storeSurvey');
    }
    this.casingForm.reset(this.casing);
    if (doPreserveChanges) {
      Object.keys(preserveChanges).forEach(name => {
        const control = this.casingForm.controls[name];
        control.patchValue(preserveChanges[name]);
        control.markAsDirty();
      });
    }
  }

  goBack(): void {
    this._location.back();
  };

  createNewVolume(): void {
    this.casing.storeVolume = new StoreVolume({
      volumeDate: new Date(),
      volumeType: 'ESTIMATE',
      source: 'MTN Casing App'
    });
    this.rebuildForm(true);
  }

  showExistingVolumes() {
    const storeId = parseInt(this.route.snapshot.paramMap.get('storeId'), 10);
    const volumesDialog = this.dialog.open(StoreVolumesSelectionComponent, {data: {storeId: storeId}});
    volumesDialog.afterClosed().subscribe(result => {
      if (result != null) {
        if (this.casing.storeVolume != null) {
          const data = {
            title: 'Replace Volume',
            question: 'This will replace the current casing volume, losing any unsaved changes. Are you sure?'
          };
          const confirmDialog = this.dialog.open(ConfirmDialogComponent, {data: data});
          confirmDialog.afterClosed().subscribe(confirmation => {
            if (confirmation) {
              this.useVolume(result);
            }
          });
        } else {
          this.useVolume(result);
        }
      }
    });
  }

  useVolume(volume: SimplifiedStoreVolume) {
    this.savingVolume = true;
    this.storeCasingService.setStoreVolume(this.casing, volume)
      .finally(() => this.savingVolume = false)
      .subscribe((casing: StoreCasing) => {
        this.casing = casing;
        this.rebuildForm(true);
        this.storeVolumeForm.reset(this.casing.storeVolume);
      });
  }

  removeVolume() {
    if (this.storeVolumeForm.dirty) {
      console.error('Dirty volume form');
    } else {
      if (this.casing.storeVolume != null && this.casing.storeVolume.id == null) {
        this.casing.storeVolume = null;
        this.rebuildForm(true);
      } else {
        this.removingVolume = true;
        this.storeCasingService.removeStoreVolume(this.casing)
          .finally(() => this.removingVolume = false)
          .subscribe((casing: StoreCasing) => {
            this.casing = casing;
            this.rebuildForm(true);
          });
      }
    }
  }

  saveForm() {
    // TODO
  }

  addDashboardProject() {
    this.addProject(this.casingDashboardService.selectedProject);
  }

  showProjectSelection() {
    const dialogRef = this.dialog.open(SelectProjectComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'clear') {
        console.log('Project Selection Dialog Closed');
      } else if (result != null) {
        this.addProject(result);
      }
    });
  }

  private addProject(project: Project | SimplifiedProject) {
    const existingProject = this.casing.projects.find((p: SimplifiedProject) => p.id === project.id);
    if (existingProject != null) {
      console.warn('Cannot add same project twice');
    } else {
      this.loadingProject = true;
      this.storeCasingService.addProject(this.casing, project)
        .finally(() => this.loadingProject = false)
        .subscribe((casing: StoreCasing) => {
          this.casing = casing;
          this.rebuildForm(true);
        });
    }
  }

  removeProject(project: SimplifiedProject) {
    this.loadingProject = true;
    this.storeCasingService.removeProject(this.casing, project)
      .finally(() => this.loadingProject = false)
      .subscribe((casing: StoreCasing) => {
        this.casing = casing;
        this.rebuildForm(true);
      });
  }

  showStatusDialog() {
    const storeId = parseInt(this.route.snapshot.paramMap.get('storeId'), 10);
    this.editingStoreStatus = true;
    this.storeService.getOneById(storeId)
      .subscribe((store: Store) => {
        const config = {data: {store: store, allowStatusSelection: true}, disableClose: true};
        const storeStatusDialog = this.dialog.open(StoreStatusesDialogComponent, config);
        storeStatusDialog.afterClosed().subscribe(result => {
          if (result instanceof StoreStatus || result instanceof SimplifiedStoreStatus) {
            this.storeCasingService.setStoreStatus(this.casing, result)
              .finally(() => this.editingStoreStatus = false)
              .subscribe((casing: StoreCasing) => {
                this.casing = casing;
                this.rebuildForm(true);
              });
          } else {
            this.editingStoreStatus = false;
          }
        });
      });
  }

  showFieldInfo(title: string, message: string) {
    this.dialog.open(DataFieldInfoDialogComponent, {data: {title: title, message: message}});
  }

  calculateTotalAreaFromSales() {
    const salesControl = this.casingForm.get('storeSurvey.areaSales');
    const percentControl = this.casingForm.get('storeSurvey.areaSalesPercentOfTotal');
    if (salesControl.valid && percentControl.valid) {
      const salesArea = parseFloat(salesControl.value);
      const percent = parseFloat(percentControl.value);
      if (!isNaN(salesArea) && !isNaN(percent)) {
        const calculatedTotal = Math.round(salesArea / (percent / 100));
        const control = this.casingForm.get('storeSurvey.areaTotal');
        control.setValue(calculatedTotal);
        control.markAsDirty();
      }
    }
  }

  calculateSalesAreaFromTotal() {
    const totalControl = this.casingForm.get('storeSurvey.areaTotal');
    const percentControl = this.casingForm.get('storeSurvey.areaSalesPercentOfTotal');
    if (totalControl.valid && percentControl.valid) {
      const totalArea = parseFloat(totalControl.value);
      const percent = parseFloat(percentControl.value);
      if (!isNaN(totalArea) && !isNaN(percent)) {
        const calculatedSales = Math.round(totalArea * (percent / 100));
        const control = this.casingForm.get('storeSurvey.areaSales');
        control.setValue(calculatedSales);
        control.markAsDirty();
      }
    }
  }

  openAreaCalculator() {
    const dialogRef = this.dialog.open(AreaCalculatorComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        if (result.salesArea != null) {
          const control = this.casingForm.get('storeSurvey.areaSales');
          control.setValue(result.salesArea);
          control.markAsDirty();
        } else if (result.totalArea != null) {
          const control = this.casingForm.get('storeSurvey.areaTotal');
          control.setValue(result.totalArea);
          control.markAsDirty();
        }
      }
    });
  }

  calculateDepartmentVolumesFromTotal() {
    const totalVolumeControl = this.casingForm.get('storeVolume.volumeTotal');
    if (totalVolumeControl != null && totalVolumeControl.valid) {
      const totalVolume = parseFloat(totalVolumeControl.value);
      this.calculateDepartmentVolume(totalVolume, 'Meat');
      this.calculateDepartmentVolume(totalVolume, 'Produce');
      this.calculateDepartmentVolume(totalVolume, 'Grocery');
      this.calculateDepartmentVolume(totalVolume, 'NonFood');
      this.calculateDepartmentVolume(totalVolume, 'Other');
    }
  }

  private calculateDepartmentVolume(totalVolume: number, departmentName: string) {
    const percentControl = this.casingForm.get(`storeVolume.volumePercent${departmentName}`);
    if (percentControl.valid) {
      const percent = parseFloat(percentControl.value);
      if (!isNaN(percent)) {
        const calculatedDeptVolume = totalVolume * (percent / 100);
        const volumeControl = this.casingForm.get(`storeVolume.volume${departmentName}`);
        volumeControl.setValue(calculatedDeptVolume);
        volumeControl.markAsDirty();
      }
    }
  }

  calculateTotalVolumeFromDepartments() {
    const meatEstimate = this.getDeptEstimateOfTotal('Meat');
    const produceEstimate = this.getDeptEstimateOfTotal('Produce');
    const groceryEstimate = this.getDeptEstimateOfTotal('Grocery');
    const nonFoodEstimate = this.getDeptEstimateOfTotal('NonFood');
    const otherEstimate = this.getDeptEstimateOfTotal('Other');
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
      const totalVolumeControl = this.casingForm.get('storeVolume.volumeTotal');
      totalVolumeControl.setValue(roundedEstimate);
      totalVolumeControl.markAsDirty();
    }
  }

  private getDeptEstimateOfTotal(departmentName: string) {
    const volumeControl = this.casingForm.get(`storeVolume.volume${departmentName}`);
    const percentControl = this.casingForm.get(`storeVolume.volumePercent${departmentName}`);
    if (volumeControl.valid && percentControl.valid) {
      const deptVolume = parseFloat(volumeControl.value);
      const percent = parseFloat(percentControl.value);
      if (!isNaN(deptVolume) && !isNaN(percent)) {
        return deptVolume / (percent / 100);
      }
    }
    return null;
  }

}
