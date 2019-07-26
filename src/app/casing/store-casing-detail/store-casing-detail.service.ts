import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '../../models/full/store';
import { StoreCasing } from '../../models/full/store-casing';
import { StoreCasingService } from '../../core/services/store-casing.service';
import { StoreSurveyService } from '../../core/services/store-survey.service';
import { StoreService } from '../../core/services/store.service';
import { StoreVolumeService } from '../../core/services/store-volume.service';
import { ShoppingCenterService } from '../../core/services/shopping-center.service';
import { ShoppingCenterCasingService } from '../../core/services/shopping-center-casing.service';
import { ShoppingCenterSurveyService } from '../../core/services/shopping-center-survey.service';
import { finalize, tap } from 'rxjs/operators';
import { concat, forkJoin, Observable } from 'rxjs';
import { StoreSurvey } from '../../models/full/store-survey';
import { ShoppingCenterCasing } from '../../models/full/shopping-center-casing';
import { ShoppingCenterSurvey } from '../../models/full/shopping-center-survey';
import { StoreVolume } from '../../models/full/store-volume';
import { MatSnackBar } from '@angular/material';
import { ErrorService } from '../../core/services/error.service';
import { SimplifiedProject } from '../../models/simplified/simplified-project';

@Injectable()
export class StoreCasingDetailService {

  validatingForms: FormGroup;
  storeForm: FormGroup;
  storeCasingForm: FormGroup;
  storeVolumeForm: FormGroup;
  storeSurveyForm: FormGroup;
  shoppingCenterCasingForm: FormGroup;
  shoppingCenterSurveyForm: FormGroup;

  store: Store;
  storeName: string;
  storeCasing: StoreCasing;

  saving = false;
  loading = false;
  savingVolume = false;
  removingVolume = false;
  loadingProject = false;

  readonly conditions = ['POOR', 'FAIR', 'AVERAGE', 'GOOD', 'EXCELLENT'];

  constructor(private storeCasingService: StoreCasingService,
              private storeSurveyService: StoreSurveyService,
              private storeService: StoreService,
              private storeVolumeService: StoreVolumeService,
              private shoppingCenterService: ShoppingCenterService,
              private shoppingCenterCasingService: ShoppingCenterCasingService,
              private shoppingCenterSurveyService: ShoppingCenterSurveyService,
              private snackBar: MatSnackBar,
              private errorService: ErrorService,
              private fb: FormBuilder) {
    this.createForms();
  }

  initData(storeId: number, storeCasingId: number) {

    const getStore = this.storeService.getOneById(storeId)
      .pipe(tap((store: Store) => {
        this.store = store;
        this.storeName = store.storeName;
        if (store.storeNumber) {
          this.storeName += ` (${store.storeNumber})`;
        }
      }));

    const getCasing = this.storeCasingService.getOneById(storeCasingId)
      .pipe(tap((storeCasing: StoreCasing) => this.storeCasing = storeCasing));

    this.loading = true;
    return forkJoin(getStore, getCasing)
      .pipe(finalize(() => this.loading = false))
      .pipe(tap(() => {
        this.storeForm.reset(this.store);
        this.storeCasingForm.reset(this.storeCasing);
        this.storeSurveyForm.reset(this.storeCasing.storeSurvey);
        this.shoppingCenterCasingForm.reset(this.storeCasing.shoppingCenterCasing);
        this.shoppingCenterSurveyForm.reset(this.storeCasing.shoppingCenterCasing.shoppingCenterSurvey);

        if (this.storeCasing.storeVolume != null) {
          this.storeVolumeForm.reset(this.storeCasing.storeVolume);
        } else {
          this.validatingForms.removeControl('storeVolume');
        }
      }));
  }

  get shoppingCenterSurvey() {
    return this.storeCasing.shoppingCenterCasing.shoppingCenterSurvey;
  }

  save() {
    const updates: Observable<any>[] = [];
    if (this.storeForm.dirty) {
      const updatedStore = this.prepareSaveObject(this.storeForm, this.store);
      updates.push(this.storeService.update(updatedStore)
        .pipe(tap((store: Store) => {
          this.store = store;
          this.storeForm.reset(store);
          console.log('Store version: ' + store.version);
        })));
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
      const updatedStoreSurvey = this.prepareSaveObject(this.storeSurveyForm, this.storeCasing.storeSurvey);
      updates.push(this.storeSurveyService.update(updatedStoreSurvey)
        .pipe(tap((storeSurvey: StoreSurvey) => {
          this.storeCasing.storeSurvey = storeSurvey;
          this.storeSurveyForm.reset(storeSurvey);
          console.log('StoreSurvey, version: ' + storeSurvey.version);
        })));
    }
    if (this.shoppingCenterCasingForm.dirty) {
      const updatedShoppingCenterCasing = this.prepareSaveObject(this.shoppingCenterCasingForm, this.storeCasing.shoppingCenterCasing);
      updates.push(this.shoppingCenterCasingService.update(updatedShoppingCenterCasing)
        .pipe(tap((scCasing: ShoppingCenterCasing) => {
          this.storeCasing.shoppingCenterCasing = scCasing;
          this.shoppingCenterCasingForm.reset(scCasing);
          console.log('ShoppingCenterCasing, version: ' + scCasing.version);
        })));
    }
    if (this.shoppingCenterSurveyForm.dirty) {
      const survey = this.storeCasing.shoppingCenterCasing.shoppingCenterSurvey;
      const updatedShoppingCenterSurvey = this.prepareSaveObject(this.shoppingCenterSurveyForm, survey);
      updates.push(this.shoppingCenterSurveyService.update(updatedShoppingCenterSurvey)
        .pipe(tap((scSurvey: ShoppingCenterSurvey) => {
          this.storeCasing.shoppingCenterCasing.shoppingCenterSurvey = scSurvey;
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
          () => this.save()));
    } else {
      console.log(this.validatingForms);
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

  setStoreVolume(storeVolume: StoreVolume) {
    this.storeCasing.storeVolume = storeVolume;
    this.storeVolumeForm.reset(storeVolume);
    this.validatingForms.setControl('storeVolume', this.storeVolumeForm);
  }

  addProject(project: SimplifiedProject) {
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

  calculateDepartmentVolume(totalVolume: number, departmentName: string) {
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

  createNewVolumeCopy(volume: StoreVolume) {
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
    this.savingVolume = true;
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

  copyIntoExistingVolume(volume: StoreVolume) {
    // Maintains volume Id
    const dateControl = this.storeVolumeForm.get('volumeDate');
    const date = dateControl.value;
    this.storeVolumeForm.reset(volume);
    dateControl.setValue(date);
    this.storeVolumeForm.get('volumeTotal').markAsDirty();
    this.storeVolumeForm.get('source').setValue('MTN Casing App');
    this.save();
  }

  getDeptEstimateOfTotal(departmentName: string) {
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
        saveObject[key] = form.get(key).value;
      }
    });
    return saveObject;
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
      volumeTotal: ['', [Validators.required, Validators.min(10000), Validators.max(10000000)]],
      volumeBoxTotal: ['', [Validators.min(10000), Validators.max(100000000)]],
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
      visibilityHillDepressionBlocksView: '',
      visibilityOutparcelsBlockView: '',
      visibilitySignOnMain: '',
      visibilityStoreFacesMainRoad: '',
      visibilityTreesBlockView: '',
      visibilityRating: '',
      parkingOutparcelsInterfereWithParking: '',
      parkingDirectAccessToParking: '',
      parkingSmallParkingField: '',
      parkingHasTSpaces: '',
      parkingHasAngledSpaces: '',
      parkingHasParkingHog: '',
      parkingIsPoorlyLit: '',
      parkingRating: '',
      parkingSpaceCount: '',

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

}
