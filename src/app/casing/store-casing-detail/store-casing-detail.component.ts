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

@Component({
  selector: 'mds-store-casing-detail',
  templateUrl: './store-casing-detail.component.html',
  styleUrls: ['./store-casing-detail.component.css']
})
export class StoreCasingDetailComponent implements OnInit {

  casingForm: FormGroup;
  storeVolumeForm: FormGroup;

  casing: StoreCasing;
  storeVolumes: SimplifiedStoreVolume[];

  loading = false;
  loadingStoreVolumes = false;
  savingVolume = false;
  removingVolume = false;
  loadingProject = false;

  conditions = ['POOR', 'FAIR', 'AVERAGE', 'GOOD', 'EXCELLENT'];
  confidenceLevels = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
  volumeTypeOptions = ['ACTUAL', 'ESTIMATE', 'PLACEHOLDER', 'PROJECTION', 'THIRD_PARTY'];

  constructor(private storeCasingService: StoreCasingService,
              private storeService: StoreService,
              private route: ActivatedRoute,
              private _location: Location,
              private dialog: MatDialog,
              private errorService: ErrorService,
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
      fuelGallonsWeekly: '',
      pharmacyScriptsWeekly: '',
      pharmacyAvgDollarsPerScript: '',
      pharmacyPharmacistCount: '',
      pharmacyTechnicianCount: ''
    });

    this.storeVolumeForm = this.fb.group({
      volumeTotal: ['', [Validators.min(1000), Validators.max(10000000)]],
      volumeDate: new Date(),
      volumeType: ['', [Validators.required]],
      volumeGrocery: '',
      volumePercentGrocery: '',
      volumeMeat: '',
      volumePercentMeat: '',
      volumeNonFood: '',
      volumePercentNonFood: '',
      volumeOther: '',
      volumePercentOther: '',
      volumeProduce: '',
      volumePercentProduce: '',
      volumePlusMinus: '',
      volumeNote: '',
      volumeConfidence: ''
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
        casingDate: new Date(),
        storeStatus: new StoreStatus({})
      });
      console.log(this.casing);
      this.rebuildForm();
    }
  }

  rebuildForm() {
    const preserveChanges = {};
    Object.keys(this.casingForm.controls).forEach(name => {
      if (this.casingForm.controls[name].dirty) {
        preserveChanges[name] = this.casingForm.controls[name].value;
      }
    });
    if (this.casing.storeVolume != null) {
      this.casingForm.addControl('storeVolume', this.storeVolumeForm);
    } else {
      this.casingForm.removeControl('storeVolume');
    }
    this.casingForm.reset(this.casing);
    Object.keys(preserveChanges).forEach(name => {
      const control = this.casingForm.controls[name];
      control.patchValue(preserveChanges[name]);
      control.markAsDirty();
    });
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
    this.rebuildForm();
  }

  showExistingVolumes() {
    this.loadingStoreVolumes = true;
    const storeId = parseInt(this.route.snapshot.paramMap.get('storeId'), 10);
    this.storeService.getAllVolumes(storeId)
      .finally(() => this.loadingStoreVolumes = false)
      .subscribe((volumes: SimplifiedStoreVolume[]) => {
        this.storeVolumes = volumes.sort((a: SimplifiedStoreVolume, b: SimplifiedStoreVolume) => {
          return b.volumeDate.getTime() - a.volumeDate.getTime();
        });
      }, error1 => this.errorService.handleServerError('Failed to retrieve store volumes', error1,
        () => {}, () => this.showExistingVolumes()));
  }

  useVolume(volume: SimplifiedStoreVolume) {
    this.savingVolume = true;
    this.storeCasingService.setStoreVolume(this.casing, volume)
      .finally(() => this.savingVolume = false)
      .subscribe((casing: StoreCasing) => {
        this.storeVolumes = null;
        this.casing = casing;
        this.rebuildForm();
      });
  }

  removeVolume() {
    if (this.storeVolumeForm.dirty) {
      console.error('Dirty volume form');
    } else {
      if (this.casing.storeVolume != null && this.casing.storeVolume.id == null) {
        this.casing.storeVolume = null;
        this.rebuildForm();
      } else {
        this.removingVolume = true;
        this.storeCasingService.removeStoreVolume(this.casing)
          .finally(() => this.removingVolume = false)
          .subscribe((casing: StoreCasing) => {
            this.casing = casing;
            this.rebuildForm();
          });
      }
    }
  }

  saveForm() {
    // TODO
  }

  showProjectSelection() {
    const dialogRef = this.dialog.open(SelectProjectComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'clear') {
        console.log('Project Selection Dialog Closed');
      } else if (result != null) {
        const existingProject = this.casing.projects.find((p: SimplifiedProject) => p.id === result.id);
        if (existingProject != null) {
          console.warn('Cannot add same project twice');
        } else {
          this.loadingProject = true;
          this.storeCasingService.addProject(this.casing, result)
            .finally(() => this.loadingProject = false)
            .subscribe((casing: StoreCasing) => {
              this.casing = casing;
              this.rebuildForm();
            });
        }
      }
    });
  }

  removeProject(project: SimplifiedProject) {
    this.loadingProject = true;
    this.storeCasingService.removeProject(this.casing, project)
      .finally(() => this.loadingProject = false)
      .subscribe((casing: StoreCasing) => {
        this.casing = casing;
        this.rebuildForm();
      });
  }

}
