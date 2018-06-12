import { Component, OnInit } from "@angular/core";
import { SourceService } from "../../core/services/source.service";
import { MapService } from "../../core/services/map.service";
import { PGTokenService } from "../../core/services/pgtoken.service";
import { PlannedGroceryService } from "./planned-grocery-service.service";

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

  records: object[];
  currentRecord: object;
  currentRecordIndex: number;

  currentRecordData: object;

  pgToken: object;

  constructor(
    ss: SourceService,
    mapService: MapService,
    pgTokenService: PGTokenService,
    pgService: PlannedGroceryService
  ) {
    this.sourceService = ss;
    this.pgTokenService = pgTokenService;
    this.pgService = pgService;
  }

  ngOnInit() {
    this.pgToken = this.pgTokenService.getToken();

    this.records = this.sourceService.getSourceTable();
    this.setCurrentRecord(0);
  }

  setCurrentRecord(index: number) {
    this.currentRecordIndex = index;
    this.currentRecord = Object.assign({}, this.records[index]);

    this.pgService
      .get(
        `https://services1.arcgis.com/aUqH6d4IMis39TBB/arcgis/rest/services/BD_FUTURE_RETAIL/FeatureServer/0/query?where=OBJECTID=${
          this.currentRecord["OBJECTID"]
        }&outFields=*&returnGeometry=true&outSR=4326&f=pjson&token=${
          this.pgToken.access_token
        }`
      )
      .subscribe(record => {
        console.log(record);
        this.currentRecordData = record.features[0];
      });
  }

  onMapReady(event) {
    console.info("map is ready");
  }
}
