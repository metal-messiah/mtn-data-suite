import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';

import { AreaCalculatorComponent } from '../area-calculator/area-calculator.component';
import { CasingDashboardService } from '../casing-dashboard/casing-dashboard.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { DataFieldInfoDialogComponent } from '../../shared/data-field-info-dialog/data-field-info-dialog.component';
import { ErrorService } from '../../core/services/error.service';
import { SelectProjectComponent } from '../select-project/select-project.component';
import { ShoppingCenterCasing } from '../../models/full/shopping-center-casing';
import { ShoppingCenterCasingService } from '../../core/services/shopping-center-casing.service';
import { ShoppingCenterService } from '../../core/services/shopping-center.service';
import { ShoppingCenterSurvey } from '../../models/full/shopping-center-survey';
import { ShoppingCenterSurveyService } from '../../core/services/shopping-center-survey.service';
import { SimplifiedProject } from '../../models/simplified/simplified-project';
import { Store } from '../../models/full/store';
import { StoreCasing } from '../../models/full/store-casing';
import { StoreCasingService } from '../../core/services/store-casing.service';
import { StoreService } from '../../core/services/store.service';
import { StoreVolume } from '../../models/full/store-volume';
import { StoreVolumesSelectionComponent } from '../store-volumes-selection/store-volumes-selection.component';
import { StoreSurvey } from '../../models/full/store-survey';
import { StoreSurveyService } from '../../core/services/store-survey.service';
import { TenantListDialogComponent } from '../tenant-list-dialog/tenant-list-dialog.component';
import { AccessListDialogComponent } from '../access-list-dialog/access-list-dialog.component';
import { StoreVolumeService } from '../../core/services/store-volume.service';
import { CanComponentDeactivate } from '../../core/services/can-deactivate.guard';
import { RoutingStateService } from '../../core/services/routing-state.service';
import { finalize, tap } from 'rxjs/internal/operators';
import { concat, Observable } from 'rxjs';

@Component({
  selector: 'mds-store-casing-detail',
  templateUrl: './store-casing-detail.component.html',
  styleUrls: ['./store-casing-detail.component.css']
})
export class StoreCasingDetailComponent implements OnInit, CanComponentDeactivate {

  validatingForms: FormGroup;
  storeForm: FormGroup;
  storeCasingForm: FormGroup;
  storeVolumeForm: FormGroup;
  storeSurveyForm: FormGroup;
  shoppingCenterCasingForm: FormGroup;
  shoppingCenterSurveyForm: FormGroup;

  store: Store;
  storeCasing: StoreCasing;

  saving = false;
  loading = false;
  savingVolume = false;
  removingVolume = false;
  loadingProject = false;

  conditions = ['POOR', 'FAIR', 'AVERAGE', 'GOOD', 'EXCELLENT'];
  confidenceLevels = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
  volumeTypeOptions = ['ACTUAL', 'ESTIMATE', 'PLACEHOLDER', 'PROJECTION', 'THIRD_PARTY'];
  fitOptions = ['Aldi', 'Asian', 'Club', 'Conventional', 'Discount', 'Hispanic', 'Natural Foods', 'Quality/Service',
    'Save A Lot', 'Sprouts', 'Supercenter', 'Trader Joe\'s', 'Warehouse', 'Whole Foods'];
  formatOptions = ['Asian', 'Club', 'Combo', 'Conventional', 'Conventional Mass Merchandiser', 'Discount', 'Ethnic',
    'Food/Drug Combo', 'Hispanic', 'Independent', 'International', 'Limited Assortment', 'Natural Foods',
    'Natural/Gourmet Foods', 'Super Combo', 'Supercenter', 'Superette/Small Grocery', 'Supermarket', 'Superstore',
    'Trader Joe\'s', 'Warehouse'];

  storeStatusOptions = ['Closed', 'Dead Deal', 'New Under Construction', 'Open', 'Planned', 'Proposed', 'Remodel',
    'Rumored', 'Strong Rumor', 'Temporarily Closed'];

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
              private routingState: RoutingStateService,
              private dialog: MatDialog,
              private errorService: ErrorService,
              private snackBar: MatSnackBar,
              public casingDashboardService: CasingDashboardService,
              private fb: FormBuilder) {
    this.createForms();
  }

  private createForms() {
    this.storeForm = this.fb.group({
      fit: '',
      format: '',
      areaSales: ['', [Validators.min(1)]],
      areaSalesPercentOfTotal: ['', [Validators.min(0.01), Validators.max(100)]],
      areaTotal: ['', [Validators.min(1)]],
      areaIsEstimate: '',
      storeIsOpen24: '',
      naturalFoodsAreIntegrated: ''
    });

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
      storeStatus: ''
    });

    this.storeVolumeForm = this.fb.group({
      volumeTotal: ['', [Validators.required, Validators.min(1000), Validators.max(10000000)]],
      volumeBoxTotal: ['', [Validators.min(1000), Validators.max(10000000)]],
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
      registerCountNormal: ['', [Validators.min(1)]],
      registerCountExpress: ['', [Validators.min(1)]],
      registerCountSelfCheckout: ['', [Validators.min(1)]],
      fuelDispenserCount: ['', [Validators.min(1)]],
      pharmacyIsOpen24: '',
      pharmacyHasDriveThrough: '',
      pharmacyScriptsWeekly: ['', [Validators.min(0)]],
      pharmacyAvgDollarsPerScript: ['', [Validators.min(0)]],
      pharmacyPharmacistCount: ['', [Validators.min(0)]],
      pharmacyTechnicianCount: ['', [Validators.min(0)]],
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
      accessibilityMultipleRetailersBeforeSite: '',
      accessibilitySetBackTwiceParkingLength: '',
      accessibilityRating: '',
      parkingOutparcelsInterfereWithParking: '',
      parkingDirectAccessToParking: '',
      parkingSmallParkingField: '',
      parkingHasTSpaces: '',
      parkingHasAngledSpaces: '',
      parkingHasParkingHog: '',
      parkingIsPoorlyLit: '',
      parkingRating: '',
      parkingSpaceCount: '',
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
      seasonalityDec: ['', [Validators.min(-100), Validators.max(200)]],
      seasonalityNotes: ''
    });

    this.shoppingCenterCasingForm = this.fb.group({
      casingDate: ['', [Validators.required]],
      note: '',
      ratingBuildings: '',
      ratingLighting: '',
      ratingSynergy: '',
      ratingTenantBuildings: ''
    });

    this.shoppingCenterSurveyForm = this.fb.group({
      surveyDate: ['', [Validators.required]],
      flowHasOneWayAisles: '',
      flowRating: '',
      tenantOccupiedCount: ['', [Validators.min(0)]],
      tenantVacantCount: ['', [Validators.min(0)]],
      sqFtPercentOccupied: ['', [Validators.min(0), Validators.max(100)]]
    });

    this.validatingForms = this.fb.group({
      store: this.storeForm,
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
        this.storeForm.reset(this.store);
      }, err => console.log(err));

    if (storeCasingId == null || isNaN(storeCasingId)) {
      this.loading = false;
      this.errorService.handleServerError('Valid storeCasingId must be provided!', {}, () => this.goBack());
    } else {
      this.storeCasingService.getOneById(storeCasingId)
        .pipe(finalize(() => this.loading = false))
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

  goBack() {
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
    const volumesDialog = this.dialog.open(StoreVolumesSelectionComponent, {
      data: {storeId: storeId},
      maxWidth: '90%'
    });
    volumesDialog.afterClosed().subscribe(result => {
      if (result != null && result !== '') {
        if (this.storeCasing.storeVolume != null) {
          const data = {
            title: 'Replace Volume',
            question: 'This will replace existing volume values. Are you sure?'
          };
          const confirmDialog = this.dialog.open(ConfirmDialogComponent, {data: data});
          confirmDialog.afterClosed().subscribe(confirmation => {
            if (confirmation) {
              this.copyIntoExistingVolume(result);
            }
          });
        } else {
          this.createNewVolumeCopy(result);
        }
      }
    });
  }

  private copyIntoExistingVolume(volume: StoreVolume) {
    // Maintains volume Id
    const dateControl = this.storeVolumeForm.get('volumeDate');
    const date = dateControl.value;
    this.storeVolumeForm.reset(volume);
    dateControl.setValue(date);
    this.storeVolumeForm.get('volumeTotal').markAsDirty();
    this.storeVolumeForm.get('source').setValue('MTN Casing App');
    this.saveForm();
  }

  private createNewVolumeCopy(volume: StoreVolume) {
    this.savingVolume = true;
    const newVolume = new StoreVolume({
      volumeTotal: volume.volumeTotal,
      volumeBoxTotal: volume.volumeBoxTotal,
      volumeDate: new Date(),
      volumeType: volume.volumeType,
      source: 'MTN Casing App',
      volumeGrocery: volume.volumeGrocery,
      volumePercentGrocery: volume.volumePercentGrocery,
      volumeMeat: volume.volumeMeat,
      volumePercentMeat: volume.volumePercentMeat,
      volumeNonFood: volume.volumeNonFood,
      volumePercentNonFood: volume.volumePercentNonFood,
      volumeOther: volume.volumeOther,
      volumePercentOther: volume.volumePercentOther,
      volumeProduce: volume.volumeProduce,
      volumePercentProduce: volume.volumePercentProduce,
      volumeNote: volume.volumeNote,
      volumeConfidence: volume.volumeConfidence
    });
    this.storeCasingService.createNewVolume(this.storeCasing.id, newVolume)
      .pipe(finalize(() => this.savingVolume = false))
      .subscribe((storeCasing: StoreCasing) => {
        this.storeCasing = storeCasing;
        this.setStoreVolume(storeCasing.storeVolume);
      });
  }

  removeVolume() {
    if (this.storeCasing.storeVolume != null && this.storeCasing.storeVolume.id == null) {
      this.storeCasing.storeVolume = null;
      this.validatingForms.removeControl('storeVolume');
      this.storeVolumeForm.reset();
    } else {
      this.removingVolume = true;
      this.storeCasingService.removeStoreVolume(this.storeCasing)
        .pipe(finalize(() => this.removingVolume = false))
        .subscribe((storeCasing: StoreCasing) => {
          this.storeCasing = storeCasing;
          this.validatingForms.removeControl('storeVolume');
          this.storeVolumeForm.reset();
        });
    }
  }

  addDashboardProject() {
    this.addProject(this.casingDashboardService.getSelectedProject());
  }

  showProjectSelection() {
    const dialogRef = this.dialog.open(SelectProjectComponent, {maxWidth: '90%'});

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'clear') {
        console.log('Project Selection Dialog Closed');
      } else if (result != null) {
        this.addProject(result);
      }
    });
  }

  private addProject(project: SimplifiedProject) {
    const existingProject = this.storeCasing.projects.find((p: SimplifiedProject) => p.id === project.id);
    if (existingProject != null) {
      this.snackBar.open(`Cannot add same project twice`, null, {duration: 1000});
    } else {
      this.loadingProject = true;
      this.storeCasingService.addProject(this.storeCasing, project.id)
        .pipe(finalize(() => this.loadingProject = false))
        .subscribe((storeCasing: StoreCasing) => {
          this.storeCasing = storeCasing;
          this.snackBar.open(`Successfully updated casing`, null, {duration: 1000});
        });
    }
  }

  removeProject(project: SimplifiedProject) {
    this.loadingProject = true;
    this.storeCasingService.removeProject(this.storeCasing, project.id)
      .pipe(finalize(() => this.loadingProject = false))
      .subscribe((storeCasing: StoreCasing) => {
        this.storeCasing = storeCasing;
        this.snackBar.open(`Successfully updated casing`, null, {duration: 1000});
      });
  }

  showFieldInfo(title: string, message: string) {
    this.dialog.open(DataFieldInfoDialogComponent, {data: {title: title, message: message}});
  }

  openAreaCalculator() {
    const dialogRef = this.dialog.open(AreaCalculatorComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        if (result.salesArea != null) {
          const control = this.storeForm.get('areaSales');
          control.setValue(result.salesArea);
          control.markAsDirty();
        } else if (result.totalArea != null) {
          const control = this.storeForm.get('areaTotal');
          control.setValue(result.totalArea);
          control.markAsDirty();
        }
      }
    });
  }

  calculateDepartmentVolumesFromTotal() {
    const totalVolumeControl = this.storeVolumeForm.get('volumeTotal');
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
    const percentControl = this.storeVolumeForm.get(`volumePercent${departmentName}`);
    if (percentControl.valid) {
      const percent = parseFloat(percentControl.value);
      if (!isNaN(percent)) {
        const calculatedDeptVolume = totalVolume * (percent / 100);
        const volumeControl = this.storeVolumeForm.get(`volume${departmentName}`);
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
      const totalVolumeControl = this.storeVolumeForm.get('volumeTotal');
      totalVolumeControl.setValue(roundedEstimate);
      totalVolumeControl.markAsDirty();
    }
  }

  private getDeptEstimateOfTotal(departmentName: string) {
    const volumeControl = this.storeVolumeForm.get(`volume${departmentName}`);
    const percentControl = this.storeVolumeForm.get(`volumePercent${departmentName}`);
    if (volumeControl.valid && percentControl.valid) {
      const deptVolume = parseFloat(volumeControl.value);
      const percent = parseFloat(percentControl.value);
      if (!isNaN(deptVolume) && !isNaN(percent)) {
        return deptVolume / (percent / 100);
      }
    }
    return null;
  }

  private prepareSaveObject(form: FormGroup, updatable) {
    const saveObject = JSON.parse(JSON.stringify(updatable));
    Object.keys(form.controls).forEach(key => {
      if (form.get(key).dirty) {
        saveObject[key] = form.get(key).value
      }
    });
    return saveObject;
  }

  saveForm() {
    const updates: Observable<any>[] = [];
    if (this.storeForm.dirty) {
      const updatedStore = this.prepareSaveObject(this.storeForm, this.store);
      updates.push(this.storeService.update(updatedStore)
        .pipe(tap((store: Store) => {
          this.store = store;
          this.storeForm.reset(store);
          console.log('Store version: ' + store.version);
        })))
    }
    if (this.storeCasingForm.dirty) {
      const updatedStoreCasing = this.prepareSaveObject(this.storeCasingForm, this.storeCasing);
      updates.push(this.storeCasingService.update(updatedStoreCasing)
        .pipe(tap((storeCasing: StoreCasing) => {
          this.storeCasing = storeCasing;
          this.storeCasingForm.reset(storeCasing);
          console.log('StoreCasing, version: ' + storeCasing.version);
        })));
    }
    if (this.storeSurveyForm.dirty) {
      const updatedStoreSurvey = this.prepareSaveObject(this.storeSurveyForm, this.storeSurvey);
      updates.push(this.storeSurveyService.update(updatedStoreSurvey)
        .pipe(tap((storeSurvey: StoreSurvey) => {
          this.storeCasing.storeSurvey = storeSurvey;
          this.storeSurveyForm.reset(storeSurvey);
          console.log('StoreSurvey, version: ' + storeSurvey.version);
        })));
    }
    if (this.shoppingCenterCasingForm.dirty) {
      const updatedShoppingCenterCasing = this.prepareSaveObject(this.shoppingCenterCasingForm, this.shoppingCenterCasing);
      updates.push(this.shoppingCenterCasingService.update(updatedShoppingCenterCasing)
        .pipe(tap((scCasing: ShoppingCenterCasing) => {
          this.storeCasing.shoppingCenterCasing = scCasing;
          this.shoppingCenterCasingForm.reset(scCasing);
          console.log('ShoppingCenterCasing, version: ' + scCasing.version);
        })));
    }
    if (this.shoppingCenterSurveyForm.dirty) {
      const updatedShoppingCenterSurvey = this.prepareSaveObject(this.shoppingCenterSurveyForm, this.shoppingCenterSurvey);
      updates.push(this.shoppingCenterSurveyService.update(updatedShoppingCenterSurvey)
        .pipe(tap((scSurvey: ShoppingCenterSurvey) => {
          this.shoppingCenterCasing.shoppingCenterSurvey = scSurvey;
          this.shoppingCenterSurveyForm.reset(scSurvey);
          console.log('ShoppingCenterSurvey, version: ' + scSurvey.version);
        })));
    }
    if (this.validatingForms.get('storeVolume') != null && this.storeVolumeForm.dirty) {
      const updatedVolume = this.prepareSaveObject(this.storeVolumeForm, this.storeCasing.storeVolume);
      if (this.storeCasing.storeVolume.id != null) {
        updates.push(this.storeVolumeService.update(updatedVolume)
          .pipe(tap((storeVolume: StoreVolume) => {
            this.setStoreVolume(storeVolume);
            console.log('StoreVolume, version: ' + storeVolume.version);
          })));
      } else {
        updates.push(this.storeCasingService.createNewVolume(this.storeCasing.id, updatedVolume)
          .pipe(tap((storeCasing: StoreCasing) => {
            this.storeCasing = storeCasing;
            this.setStoreVolume(storeCasing.storeVolume);
            console.log('StoreVolume, version: ' + storeCasing.version + '; StoreVolume, version: ' + storeCasing.storeVolume.version);
          })));
      }
    }
    // Concat the updates
    let updateObservable: Observable<any> = null;
    updates.forEach(update => {
      if (updateObservable == null) {
        updateObservable = update;
      } else {
        updateObservable = concat(updateObservable, update);
      }
    });

    if (updateObservable) {
      this.saving = true;
      updateObservable
        .pipe(finalize(() => {
          this.saving = false;
          this.snackBar.open(`Successfully saved casing`, null, {duration: 1000});
        }))
        .subscribe((result) => {
          console.log(result);
        }, err => this.errorService.handleServerError('Failed to save casing!', err,
          () => console.log(err),
          () => this.saveForm()));
    } else {
      console.log(this.validatingForms);
    }
  }

  openTenantDialog() {
    const vacantControl = this.shoppingCenterSurveyForm.get('tenantVacantCount');
    const data = {
      shoppingCenterSurveyId: this.shoppingCenterSurvey.id,
      vacantCount: vacantControl.value
    };
    const dialog = this.dialog.open(TenantListDialogComponent, {data: data, maxWidth: '90%', disableClose: true});
    dialog.afterClosed().subscribe((tenantCounts: {occupied: number, vacant: number}) => {
      if (tenantCounts.vacant !== vacantControl.value) {
        vacantControl.setValue(tenantCounts.vacant);
        vacantControl.markAsDirty();
      }
      const occupiedControl = this.shoppingCenterSurveyForm.get('tenantOccupiedCount');
      if (tenantCounts.occupied !== occupiedControl.value) {
        occupiedControl.setValue(tenantCounts.occupied);
        occupiedControl.markAsDirty();
      }
    });
  }

  openAccessDialog() {
    const data = {shoppingCenterSurveyId: this.shoppingCenterSurvey.id};
    this.dialog.open(AccessListDialogComponent, {data: data, maxWidth: '90%', disableClose: true});
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.validatingForms.pristine) {
      return true;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {title: 'Warning!', question: 'Are you sure you wish to abandon unsaved changes?'}
    });
    return dialogRef.afterClosed().pipe(tap(result => {
      // Corrects for a bug between the router and CanDeactivateGuard that pops the state even if user says no
      if (!result) {
        history.pushState({}, 'site', this.routingState.getPreviousUrl());
      }
    }));
  }

  canAddSelectedProject(): boolean {
    const selectedProject = this.casingDashboardService.getSelectedProject();
    if (selectedProject == null) {
      return false;
    }
    for (const project of this.storeCasing.projects) {
      if (project.id === selectedProject.id) {
        return false;
      }
    }
    return true;
  }

}
