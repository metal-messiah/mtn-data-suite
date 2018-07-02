import { Component, OnInit } from '@angular/core';
import { SourceService } from '../../core/services/source.service';
import { MapService } from '../../core/services/map.service';
import { PGTokenService } from '../../core/services/pgtoken.service';
import { PlannedGroceryService } from './planned-grocery-service.service';
import { FormBuilder } from '@angular/forms';
import { MapPointLayer } from '../../models/map-point-layer';
import { StoreMappable } from '../../models/store-mappable';
import { PgMappable } from '../../models/pg-mappable';
import { finalize } from 'rxjs/internal/operators';

enum Actions {
  add_site = 'ADD_SITE',
  match = 'MATCH',
  add_store = 'ADD_STORE'
}

@Component({
  selector: 'mds-planned-grocery',
  templateUrl: './planned-grocery.component.html',
  styleUrls: ['./planned-grocery.component.css'],
  providers: [PlannedGroceryService]
})
export class PlannedGroceryComponent implements OnInit {
  pgMapLayer: MapPointLayer<PgMappable>;
  dbMapLayer: MapPointLayer<StoreMappable>;

  records: object[];
  currentRecord: object;
  currentRecordIndex: number;

  currentRecordData: object;

  currentDBResults: object;

  pgToken: object;

  // firstFormGroup: FormGroup;
  // secondFormGroup: FormGroup;

  isFetching = false;

  step1Completed = false;
  step1Action: string;

  step2Completed = false;
  step2Action: string;

  constructor(
    private sourceService: SourceService,
    private mapService: MapService,
    private pgTokenService: PGTokenService,
    private pgService: PlannedGroceryService,
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.pgTokenService.getToken().subscribe(resp => {
      this.pgToken = resp;
      this.records = this.sourceService.getSourceTable();
      this.setCurrentRecord(0);

      this.currentDBResults = this.sourceService.getDBTable();
    });
  }

  setStepCompleted(step, action, stepper) {
    if (step === 1) {
      this.step1Completed = true;
      this.setStepAction(step, action);
    }
    if (step === 2) {
      this.step2Completed = true;
      this.setStepAction(step, action);
    }
    setTimeout(() => {
      stepper.next();
    }, 250);
  }

  setStepAction(step, action) {
    if (step === 1) {
      this.step1Action = action;
    }
    if (step === 2) {
      this.step2Action = action;
    }
    console.log(action);
  }

  setCurrentRecord(index: number) {
    this.currentRecordIndex = index;
    this.currentRecord = Object.assign({}, this.records[index]);

    this.isFetching = true;
    this.pgService
      .get(
        `https://services1.arcgis.com/aUqH6d4IMis39TBB/arcgis/rest/services/BD_FUTURE_RETAIL/FeatureServer/0/query?where=OBJECTID=${
          this.currentRecord['OBJECTID']
        }&outFields=*&returnGeometry=true&outSR=4326&f=pjson&token=${
          this.pgToken['access_token']
        }`
      )
      .pipe(finalize(() => this.isFetching = false))
      .subscribe(record => {
        console.log(record);
        if (record == null || record['features'] == null || record['features'].length < 1) {
          // TODO Notify user of failed retrieval
          return;
        }
        this.currentRecordData = record['features'][0];

        const featureMappable = new PgMappable(this.currentRecordData);

        this.mapService.setCenter(featureMappable.getCoordinates());
        this.mapService.setZoom(15);
        this.createNewLocation(featureMappable);
      });
  }

  onMapReady(event) {
    this.pgMapLayer = new MapPointLayer();
  }

  // Called after querying PG for individual record
  createNewLocation(featureMappable: PgMappable): void {
    // Add new location to layer
    this.pgMapLayer.createMarkerFromMappable(featureMappable);
    // Add Layer to map
    this.mapService.addPointLayer(this.pgMapLayer);
  }

  cancelLocationCreation(): void {
    // Remove layer from map
    this.pgMapLayer.removeFromMap();
    // Delete new Location layer
    this.pgMapLayer = null;
  }
}
