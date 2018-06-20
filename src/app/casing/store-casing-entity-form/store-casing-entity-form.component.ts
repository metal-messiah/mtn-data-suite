import { Component, Input, OnInit } from '@angular/core';
import { StoreCasing } from '../../models/full/store-casing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DetailFormComponent } from '../../interfaces/detail-form-component';
import { CrudService } from '../../interfaces/crud-service';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreCasingService } from '../../core/services/store-casing.service';
import { Location } from '@angular/common';

@Component({
  selector: 'mds-store-casing-entity-form',
  templateUrl: './store-casing-entity-form.component.html',
  styleUrls: ['./store-casing-entity-form.component.css']
})
export class StoreCasingEntityFormComponent implements OnInit, DetailFormComponent<StoreCasing> {

  @Input() isReadOnly = false;
  @Input() storeCasing: StoreCasing;

  storeCasingForm: FormGroup;

  isLoading = false;
  isSaving = false;

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private storeCasingService: StoreCasingService,
              private _location: Location) { }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.storeCasingForm = this.fb.group({

    });
  }

  getEntityService(): CrudService<StoreCasing> {
    return this.storeCasingService;
  };

  getForm(): FormGroup {
    return this.storeCasingForm;
  };

  getNewObj(): StoreCasing {
    return new StoreCasing({});
  };

  getObj(): StoreCasing {
    return this.storeCasing;
  };

  setObj(obj: StoreCasing): void {
    this.storeCasing = obj;
    this.onObjectChange();
  };

  getRoute(): ActivatedRoute {
    return this.route;
  };


  getTypeName(): string {
    return 'store casing';
  };

  goBack() {
    this._location.back();
  };

  getSavableObj(): StoreCasing {
    const formModel = this.storeCasingForm.value;

    return new StoreCasing({
      id: this.storeCasing.id,
      casingDate: formModel.casingDate,
      conditionCeiling: formModel.conditionCeiling,
      conditionCheckstands: formModel.conditionCheckstands,
      conditionFloors: formModel.conditionFloors,
      conditionFrozenRefrigerated: formModel.conditionFrozenRefrigerated,
      conditionShelvingGondolas: formModel.conditionShelvingGondolas,
      conditionWalls: formModel.conditionWalls,
      fuelGallonsWeekly: formModel.fuelGallonsWeekly,
      pharmacyScriptsWeekly: formModel.pharmacyScriptsWeekly,
      pharmacyAvgDollarsPerScript: formModel.pharmacyAvgDollarsPerScript,
      pharmacyPharmacistCount: formModel.pharmacyPharmacistCount,
      pharmacyTechnicianCount: formModel.pharmacyTechnicianCount,
      volumeGrocery: formModel.volumeGrocery,
      volumePercentGrocery: formModel.volumePercentGrocery,
      volumeMeat: formModel.volumeMeat,
      volumePercentMeat: formModel.volumePercentMeat,
      volumeNonFood: formModel.volumeNonFood,
      volumePercentNonFood: formModel.volumePercentNonFood,
      volumeOther: formModel.volumeOther,
      volumePercentOther: formModel.volumePercentOther,
      volumeProduce: formModel.volumeProduce,
      volumePercentProduce: formModel.volumePercentProduce,
      volumePlusMinus: formModel.volumePlusMinus,
      volumeNote: formModel.volumeNote,
      volumeConfidence: formModel.volumeConfidence,
      legacyCasingId: formModel.legacyCasingId,
      storeStatus: formModel.storeStatus,
      storeVolume: formModel.storeVolume,
      storeSurvey: formModel.storeSurvey,
      projects: formModel.projects,
      createdBy: this.storeCasing.createdBy,
      createdDate: this.storeCasing.createdDate,
      updatedBy: this.storeCasing.updatedBy,
      updatedDate: this.storeCasing.updatedDate,
      version: this.storeCasing.version
    });
  };

  onObjectChange(): void {
    this.storeCasingForm.reset(this.storeCasing);
  };

  setDisabledFields(): void {
    // TODO
  };
}
