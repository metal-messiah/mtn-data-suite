import { Component, OnInit } from "@angular/core";
import { SourceService } from "../../core/services/source.service";
import { MapService } from "../../core/services/map.service";
import { PGTokenService } from "../../core/services/pgtoken.service";
import { PlannedGroceryService } from "./planned-grocery-service.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Mappable } from "../../interfaces/mappable";
import { MapPointLayer } from "../../models/map-point-layer";
import { Color } from "../../core/functionalEnums/Color";
import { MarkerShape } from "../../core/functionalEnums/MarkerShape";
import { IconService } from "../../core/services/icon.service";

enum Actions {
  add_site = "ADD_SITE",
  match = "MATCH",
  add_store = "ADD_STORE"
}

@Component({
  selector: "mds-planned-grocery",
  templateUrl: "./planned-grocery.component.html",
  styleUrls: ["./planned-grocery.component.css"],
  providers: [PlannedGroceryService]
})
export class PlannedGroceryComponent implements OnInit {
  sourceService: SourceService;
  pgTokenService: PGTokenService;
  pgService: PlannedGroceryService;
  mapService: MapService;
  iconService;

  pgMapLayer: MapPointLayer;
  dbMapLayer: MapPointLayer;

  records: object[];
  currentRecord: object;
  currentRecordIndex: number;

  currentRecordData: object;

  currentDBResults: object;

  pgToken: object;

  // firstFormGroup: FormGroup;
  // secondFormGroup: FormGroup;

  isFetching: boolean = false;

  step1Completed: boolean = false;
  step1Action: string;

  step2Completed: boolean = false;
  step2Action: string;

  constructor(
    ss: SourceService,
    mapService: MapService,
    pgTokenService: PGTokenService,
    pgService: PlannedGroceryService,
    private _formBuilder: FormBuilder,
    iconService: IconService,
  ) {
    this.sourceService = ss;
    this.pgTokenService = pgTokenService;
    this.pgService = pgService;
    this.mapService = mapService;
    this.iconService = iconService;
  }

  ngOnInit() {
    this.pgTokenService.getToken().subscribe(resp => {
      this.pgToken = resp;
      this.records = this.sourceService.getSourceTable();
      this.setCurrentRecord(0);

      this.currentDBResults = this.sourceService.getDBTable();
    });
  }

  setStepCompleted(step, action, stepper) {
    if (step == 1) {
      this.step1Completed = true;
      this.setStepAction(step, action);
    }
    if (step == 2) {
      this.step2Completed = true;
      this.setStepAction(step, action);
    }
    setTimeout(() => {
      stepper.next();
    }, 250);
  }

  setStepAction(step, action) {
    if (step == 1) {
      this.step1Action = action;
    }
    if (step == 2) {
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
          this.currentRecord["OBJECTID"]
        }&outFields=*&returnGeometry=true&outSR=4326&f=pjson&token=${
          this.pgToken["access_token"]
        }`
      )
      .subscribe(record => {
        console.log(record);
        if (record) {
          this.currentRecordData = record["features"]
            ? record["features"][0]
            : null;
        }
        this.isFetching = false;

        let lat = record["features"]
          ? record["features"][0]["geometry"]["y"]
          : 40.356714;
        let lng = record["features"]
          ? record["features"][0]["geometry"]["x"]
          : -111.770421;

        this.mapService.setCenter({ lat, lng });
        this.mapService.setZoom(15);
        this.createNewLocation();
      });
  }

  onMapReady(event) {}

  createNewLocation(): void {
    this.pgMapLayer = new MapPointLayer({
      getMappableIsDraggable: (mappable: Mappable) => {
        return true;
      },
      getMappableIcon: (mappable: Mappable) => {
        return this.iconService.getIcon(
          Color.PURPLE,
          Color.WHITE,
          MarkerShape.DEFAULT
        );
      },
      getMappableLabel: (mappable: Mappable) => {
        return null;
      }
    });
    // Create new location
    let point = {
      getCoordinates: () => {
        return this.mapService.getCenter();
      },
      id: 0
    };
    // Add new location to layer
    this.pgMapLayer.createMarkerFromMappable(point);
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
