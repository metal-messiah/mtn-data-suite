import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { MatDialog, MatSnackBar } from '@angular/material';

import { AuditingEntity } from '../../models/auditing-entity';
import { AreaCalculatorComponent } from '../area-calculator/area-calculator.component';
import { CasingDashboardService } from '../casing-dashboard/casing-dashboard.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { DataFieldInfoDialogComponent } from '../../shared/data-field-info-dialog/data-field-info-dialog.component';
import { ErrorService } from '../../core/services/error.service';
import { Project } from '../../models/full/project';
import { SelectProjectComponent } from '../select-project/select-project.component';
import { ShoppingCenterCasing } from '../../models/full/shopping-center-casing';
import { ShoppingCenterCasingService } from '../../core/services/shopping-center-casing.service';
import { ShoppingCenterService } from '../../core/services/shopping-center.service';
import { ShoppingCenterSurvey } from '../../models/full/shopping-center-survey';
import { ShoppingCenterSurveyService } from '../../core/services/shopping-center-survey.service';
import { SimplifiedProject } from '../../models/simplified/simplified-project';
import { SimplifiedStoreStatus } from '../../models/simplified/simplified-store-status';
import { SimplifiedStoreVolume } from '../../models/simplified/simplified-store-volume';
import { Store } from '../../models/full/store';
import { StoreCasing } from '../../models/full/store-casing';
import { StoreCasingService } from '../../core/services/store-casing.service';
import { StoreService } from '../../core/services/store.service';
import { StoreStatus } from '../../models/full/store-status';
import { StoreStatusesDialogComponent } from '../store-statuses-dialog/store-statuses-dialog.component';
import { StoreVolume } from '../../models/full/store-volume';
import { StoreVolumesSelectionComponent } from '../store-volumes-selection/store-volumes-selection.component';
import { StoreSurvey } from '../../models/full/store-survey';
import { StoreSurveyService } from '../../core/services/store-survey.service';
import { TenantListDialogComponent } from '../tenant-list-dialog/tenant-list-dialog.component';
import { AccessListDialogComponent } from '../access-list-dialog/access-list-dialog.component';
import { StoreVolumeService } from '../../core/services/store-volume.service';

@Component({
  selector: 'mds-store-casing-detail',
  templateUrl: './store-casing-detail.component.html',
  styleUrls: ['./store-casing-detail.component.css']
})
export class StoreCasingDetailComponent implements OnInit {

  validatingForms: FormGroup;
  storeCasingForm: FormGroup;
  storeVolumeForm: FormGroup;
  storeSurveyForm: FormGroup;
  shoppingCenterCasingForm: FormGroup;
  shoppingCenterSurveyForm: FormGroup;

  store: Store;
  storeCasing: StoreCasing;

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
    {name: 'departmentExpandedGm', title: 'Expanded General Merchandise', info: '???'},
    {name: 'departmentExtensivePreparedFoods', title: 'Extensive Prepared Foods', info: '???'},
    {name: 'departmentFloral', title: 'Floral', info: '???'},
    {name: 'departmentFuel', title: 'Fuel', info: '???'},
    {name: 'departmentHotBar', title: 'HotBar', info: '???'},
    {name: 'departmentInStoreRestaurant', title: 'In Store Restaurant', info: '???'},
    {name: 'departmentLiquor', title: 'Liquor', info: '???'},
    {name: 'departmentMeat', title: 'Meat', info: '???'},
    {name: 'departmentNatural', title: 'Natural', info: '???'},
    {name: 'departmentOliveBar', title: 'OliveBar', info: '???'},
    {name: 'departmentOnlinePickup', title: 'Online Pickup', info: '???'},
    {name: 'departmentPharmacy', title: 'Pharmacy', info: '???'},
    {name: 'departmentPreparedFoods', title: 'Prepared Foods', info: '???'},
    {name: 'departmentSaladBar', title: 'SaladBar', info: '???'},
    {name: 'departmentSeafood', title: 'Seafood', info: '???'},
    {name: 'departmentSeating', title: 'Seating', info: '???'},
    {name: 'departmentSushi', title: 'Sushi', info: '???'},
    {name: 'departmentWine', title: 'Wine', info: '???'}
  ];

  constructor(private storeCasingService: StoreCasingService,
              private storeSurveyService: StoreSurveyService,
              private storeService: StoreService,
              private storeVolumeService: StoreVolumeService,
              private shoppingCenterService: ShoppingCenterService,
              private shoppingCenterCasingService: ShoppingCenterCasingService,
              private shoppingCenterSurveyService: ShoppingCenterSurveyService,
              private route: ActivatedRoute,
              private _location: Location,
              private dialog: MatDialog,
              private errorService: ErrorService,
              private snackBar: MatSnackBar,
              public casingDashboardService: CasingDashboardService,
              private fb: FormBuilder) {
    this.createForms();
  }

  private createForms() {
    this.storeCasingForm = this.fb.group({
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
      pharmacyTechnicianCount: ['', [Validators.min(0)]]
    });

    this.storeVolumeForm = this.fb.group({
      volumeTotal: ['', [Validators.required, Validators.min(1000), Validators.max(10000000)]],
      volumeDate: new Date(),
      volumeType: ['', [Validators.required]],
      source: ['MTN Casing App', [Validators.required]],
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
      areaSales: ['', [Validators.min(1)]],
      areaSalesPercentOfTotal: ['', [Validators.min(0.01), Validators.max(100)]],
      areaTotal: ['', [Validators.min(1)]],
      areaIsEstimate: '',
      naturalFoodsAreIntegrated: '',
      storeIsOpen24: '',
      registerCountNormal: ['', [Validators.min(1)]],
      registerCountExpress: ['', [Validators.min(1)]],
      registerCountSelfCheckout: ['', [Validators.min(1)]],
      fuelDispenserCount: ['', [Validators.min(1)]],
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

    this.shoppingCenterCasingForm = this.fb.group({
      casingDate: ['', [Validators.required]],
      note: '',
      ratingParkingLot: '',
      ratingBuildings: '',
      ratingLighting: '',
      ratingSynergy: ''
    });

    this.shoppingCenterSurveyForm = this.fb.group({
      surveyDate: ['', [Validators.required]],
      centerType: '',
      note: '',
      flowHasLandscaping: '',
      flowHasSpeedBumps: '',
      flowHasStopSigns: '',
      flowHasOneWayAisles: '',
      parkingHasAngledSpaces: '',
      parkingHasParkingHog: '',
      parkingIsPoorlyLit: '',
      parkingSpaceCount: '',
      tenantOccupiedCount: '',
      tenantVacantCount: '',
      sqFtPercentOccupied: ['', [Validators.min(0), Validators.max(100)]]
    });

    this.validatingForms = this.fb.group({
      storeCasing: this.storeCasingForm,
      storeVolume: this.storeVolumeForm,
      storeSurvey: this.storeSurveyForm,
      shoppingCenterCasing: this.shoppingCenterCasingForm,
      shoppingCenterSurvey: this.shoppingCenterSurveyForm,
    });
  }

  ngOnInit() {
    const storeId = parseInt(this.route.snapshot.paramMap.get('storeId'), 10);
    const storeCasingIdParam = this.route.snapshot.paramMap.get('storeCasingId');
    const storeCasingId = parseInt(storeCasingIdParam, 10);

    this.loading = true;

    this.storeService.getOneById(storeId)
      .subscribe((store: Store) => {
        this.store = store;
      }, err => {
      });
    if (storeCasingId == null || isNaN(storeCasingId)) {
      this.loading = false;
      this.errorService.handleServerError('Valid storeCasingId must be provided!', {}, () => this.goBack());
    } else {
      this.storeCasingService.getOneById(storeCasingId)
        .finally(() => {
          this.loading = false;
        })
        .subscribe((storeCasing: StoreCasing) => {
          this.storeCasing = storeCasing;
          this.rebuildAllForms();
        }, err => this.errorService.handleServerError('Failed to retrieve Store Casing!', err,
          () => this.goBack()));
    }
  }

  rebuildAllForms() {
    this.storeCasingForm.reset(this.storeCasing);
    this.storeSurveyForm.reset(this.storeSurvey);
    this.shoppingCenterCasingForm.reset(this.shoppingCenterCasing);
    this.shoppingCenterSurveyForm.reset(this.shoppingCenterSurvey);

    if (this.storeCasing.storeVolume != null) {
      this.storeVolumeForm.reset(this.storeCasing.storeVolume);
    } else {
      this.validatingForms.removeControl('storeVolume');
    }
  }

  get storeSurvey(): StoreSurvey {
    if (this.storeCasing.storeSurvey == null) {
      this.errorService.handleServerError('Invalid State: Missing Store Survey', {}, () => this.goBack());
    }
    return this.storeCasing.storeSurvey;
  }

  get shoppingCenterCasing(): ShoppingCenterCasing {
    if (this.storeCasing.shoppingCenterCasing == null) {
      this.errorService.handleServerError('Invalid State: Missing Shopping Center Casing', {}, () => this.goBack());
    }
    return this.storeCasing.shoppingCenterCasing;
  }

  get shoppingCenterSurvey(): ShoppingCenterSurvey {
    if (this.shoppingCenterCasing.shoppingCenterSurvey == null) {
      this.errorService.handleServerError('Invalid State: Missing Shopping Center Survey', {}, () => this.goBack());
    }
    return this.shoppingCenterCasing.shoppingCenterSurvey;
  }

  goBack(): void {
    this._location.back();
  };

  createNewVolume(): void {
    this.setStoreVolume(new StoreVolume({
      volumeDate: new Date(),
      volumeType: 'ESTIMATE',
      source: 'MTN Casing App'
    }));
  }

  private setStoreVolume(storeVolume: StoreVolume) {
    this.storeCasing.storeVolume = storeVolume;
    this.storeVolumeForm.reset(storeVolume);
    this.validatingForms.setControl('storeVolume', this.storeVolumeForm);
  }

  showExistingVolumes() {
    const storeId = parseInt(this.route.snapshot.paramMap.get('storeId'), 10);
    const volumesDialog = this.dialog.open(StoreVolumesSelectionComponent, {data: {storeId: storeId}});
    volumesDialog.afterClosed().subscribe(result => {
      if (result != null) {
        if (this.storeCasing.storeVolume != null) {
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
    this.storeCasingService.setStoreVolume(this.storeCasing, volume)
      .finally(() => this.savingVolume = false)
      .subscribe((casing: StoreCasing) => {
        this.storeCasing = casing;
        this.storeVolumeForm.reset(this.storeCasing.storeVolume);
        this.validatingForms.addControl('storeVolume', this.storeVolumeForm);
      });
  }

  removeVolume() {
    if (this.storeCasing.storeVolume != null && this.storeCasing.storeVolume.id == null) {
      this.storeCasing.storeVolume = null;
      this.validatingForms.removeControl('storeVolume');
    } else {
      this.removingVolume = true;
      this.storeCasingService.removeStoreVolume(this.storeCasing)
        .finally(() => this.removingVolume = false)
        .subscribe((casing: StoreCasing) => {
          this.storeCasing = casing;
          this.validatingForms.removeControl('storeVolume');
        });
    }
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
    const existingProject = this.storeCasing.projects.find((p: SimplifiedProject) => p.id === project.id);
    if (existingProject != null) {
      console.warn('Cannot add same project twice');
    } else {
      this.loadingProject = true;
      this.storeCasingService.addProject(this.storeCasing, project)
        .finally(() => this.loadingProject = false)
        .subscribe((casing: StoreCasing) => {
          this.storeCasing = casing;
        });
    }
  }

  removeProject(project: SimplifiedProject) {
    this.loadingProject = true;
    this.storeCasingService.removeProject(this.storeCasing, project)
      .finally(() => this.loadingProject = false)
      .subscribe((casing: StoreCasing) => {
        this.storeCasing = casing;
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
            this.storeCasingService.setStoreStatus(this.storeCasing, result)
              .finally(() => this.editingStoreStatus = false)
              .subscribe((casing: StoreCasing) => {
                this.storeCasing = casing;
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
    const salesControl = this.storeSurveyForm.get('areaSales');
    const percentControl = this.storeSurveyForm.get('areaSalesPercentOfTotal');
    if (salesControl.valid && percentControl.valid) {
      const salesArea = parseFloat(salesControl.value);
      const percent = parseFloat(percentControl.value);
      if (!isNaN(salesArea) && !isNaN(percent)) {
        const calculatedTotal = Math.round(salesArea / (percent / 100));
        const control = this.storeSurveyForm.get('areaTotal');
        control.setValue(calculatedTotal);
        control.markAsDirty();
      }
    }
  }

  calculateSalesAreaFromTotal() {
    const totalControl = this.storeSurveyForm.get('areaTotal');
    const percentControl = this.storeSurveyForm.get('areaSalesPercentOfTotal');
    if (totalControl.valid && percentControl.valid) {
      const totalArea = parseFloat(totalControl.value);
      const percent = parseFloat(percentControl.value);
      if (!isNaN(totalArea) && !isNaN(percent)) {
        const calculatedSales = Math.round(totalArea * (percent / 100));
        const control = this.storeSurveyForm.get('areaSales');
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
          const control = this.storeSurveyForm.get('areaSales');
          control.setValue(result.salesArea);
          control.markAsDirty();
        } else if (result.totalArea != null) {
          const control = this.storeSurveyForm.get('areaTotal');
          control.setValue(result.totalArea);
          control.markAsDirty();
        }
      }
    });
  }

  calculateDepartmentVolumesFromTotal() {
    const totalVolumeControl = this.storeCasingForm.get('storeVolume.volumeTotal');
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
    const percentControl = this.storeCasingForm.get(`storeVolume.volumePercent${departmentName}`);
    if (percentControl.valid) {
      const percent = parseFloat(percentControl.value);
      if (!isNaN(percent)) {
        const calculatedDeptVolume = totalVolume * (percent / 100);
        const volumeControl = this.storeCasingForm.get(`storeVolume.volume${departmentName}`);
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
      const totalVolumeControl = this.storeCasingForm.get('storeVolume.volumeTotal');
      totalVolumeControl.setValue(roundedEstimate);
      totalVolumeControl.markAsDirty();
    }
  }

  private getDeptEstimateOfTotal(departmentName: string) {
    const volumeControl = this.storeCasingForm.get(`storeVolume.volume${departmentName}`);
    const percentControl = this.storeCasingForm.get(`storeVolume.volumePercent${departmentName}`);
    if (volumeControl.valid && percentControl.valid) {
      const deptVolume = parseFloat(volumeControl.value);
      const percent = parseFloat(percentControl.value);
      if (!isNaN(deptVolume) && !isNaN(percent)) {
        return deptVolume / (percent / 100);
      }
    }
    return null;
  }

  private assignAuditingEntityAttributes(target: AuditingEntity, source: AuditingEntity) {
    const strippedAE = new AuditingEntity(source);
    Object.assign(target, strippedAE);
  };

  private prepareSaveStoreCasing(): StoreCasing {
    const saveStoreCasing = new StoreCasing(this.storeCasingForm.value);
    this.assignAuditingEntityAttributes(saveStoreCasing, this.storeCasing);
    return saveStoreCasing;
  }

  private prepareSaveStoreSurvey(): StoreSurvey {
    const saveStoreSurvey = new StoreSurvey(this.storeSurveyForm.value);
    this.assignAuditingEntityAttributes(saveStoreSurvey, this.storeCasing.storeSurvey);
    return saveStoreSurvey;
  }

  private prepareStoreVolume(): StoreVolume {
    const saveStoreVolume = new StoreVolume(this.storeVolumeForm.value);
    this.assignAuditingEntityAttributes(saveStoreVolume, this.storeCasing.storeVolume);
    return saveStoreVolume;
  }

  private prepareSaveShoppingCenterCasing(): ShoppingCenterCasing {
    const shoppingCenterCasing = new ShoppingCenterCasing(this.shoppingCenterCasingForm.value);
    this.assignAuditingEntityAttributes(shoppingCenterCasing, this.storeCasing.shoppingCenterCasing);
    return shoppingCenterCasing;
  }

  private prepareSaveShoppingCenterSurvey(): ShoppingCenterSurvey {
    const shoppingCenterSurvey = new ShoppingCenterSurvey(this.shoppingCenterSurveyForm.value);
    this.assignAuditingEntityAttributes(shoppingCenterSurvey, this.shoppingCenterSurvey);
    return shoppingCenterSurvey;
  }

  saveForm() {
    const updates: Observable<any>[] = [];
    if (this.storeCasingForm.dirty) {
      updates.push(this.storeCasingService.update(this.prepareSaveStoreCasing())
        .do((storeCasing: StoreCasing) => {
          this.storeCasing = storeCasing;
          this.storeCasingForm.reset(storeCasing);
        }));
    }
    if (this.storeSurveyForm.dirty) {
      updates.push(this.storeSurveyService.update(this.prepareSaveStoreSurvey())
        .do((storeSurvey: StoreSurvey) => {
          this.storeCasing.storeSurvey = storeSurvey;
          this.storeSurveyForm.reset(storeSurvey);
        }));
    }
    if (this.shoppingCenterCasingForm.dirty) {
      updates.push(this.shoppingCenterCasingService.update(this.prepareSaveShoppingCenterCasing())
        .do((scCasing: ShoppingCenterCasing) => {
          this.storeCasing.shoppingCenterCasing = scCasing;
          this.shoppingCenterCasingForm.reset(scCasing);
        }));
    }
    if (this.shoppingCenterSurveyForm.dirty) {
      updates.push(this.shoppingCenterSurveyService.update(this.prepareSaveShoppingCenterSurvey())
        .do((scSurvey: ShoppingCenterSurvey) => {
          this.shoppingCenterCasing.shoppingCenterSurvey = scSurvey;
          this.shoppingCenterSurveyForm.reset(scSurvey);
        }));
    }
    if (this.validatingForms.get('storeVolume') != null && this.storeVolumeForm.dirty) {
      if (this.storeCasing.storeVolume.id != null) {
        updates.push(this.storeVolumeService.update(this.prepareStoreVolume())
          .do((storeVolume: StoreVolume) => this.setStoreVolume(storeVolume)));
      } else {
        updates.push(this.storeCasingService.createNewVolume(this.storeCasing.id, this.prepareStoreVolume())
          .do((storeVolume: StoreVolume) => this.setStoreVolume(storeVolume)));
      }
    }

    // Concat the updates
    let updateObservable: Observable<any> = null;
    updates.forEach(update => {
      if (updateObservable == null) {
        updateObservable = update;
      } else {
        updateObservable = updateObservable.concat(update);
      }
    });

    if (updateObservable != null) {
      updateObservable.subscribe(result => {
        if (result instanceof StoreCasing) {
          console.log('StoreCasing, version: ' + result.version);
        }
        if (result instanceof StoreSurvey) {
          console.log('StoreSurvey, version: ' + result.version);
        }
        if (result instanceof ShoppingCenterCasing) {
          console.log('ShoppingCenterCasing, version: ' + result.version);
        }
        if (result instanceof ShoppingCenterSurvey) {
          console.log('ShoppingCenterSurvey, version: ' + result.version);
        }
        this.snackBar.open(`Successfully saved casing`, null, {duration: 1000});
      });
    }
  }

  openTenantDialog() {
    const data = {shoppingCenterSurveyId: this.shoppingCenterSurvey.id};
    const dialogRef = this.dialog.open(TenantListDialogComponent, {data: data});
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openAccessDialog() {
    const data = {shoppingCenterSurveyId: this.shoppingCenterSurvey.id};
    const dialogRef = this.dialog.open(AccessListDialogComponent, {data: data});
    dialogRef.afterClosed().subscribe(result => {
    });
  }

}
