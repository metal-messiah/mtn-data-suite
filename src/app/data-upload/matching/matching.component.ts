import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounce, delay } from 'rxjs/operators';
import * as papa from 'papaparse';

import { MapService } from '../../core/services/map.service';
import { DbEntityMarkerService } from '../../core/services/db-entity-marker.service';
import { of, Subscription } from 'rxjs';
import { StoreSource } from '../../models/full/store-source';
import { SimplifiedStore } from '../../models/simplified/simplified-store';
import { SourceLocationMatchingService } from '../store-source/source-location-matching.service';
import { StoreSourceLayer } from '../../models/store-source-layer';
import { EntitySelectionService } from '../../core/services/entity-selection.service';
import { CasingProjectService } from '../../casing/casing-project.service';
import { StoreSourceData } from '../../models/simplified/store-source-data';

@Component({
  selector: 'mds-matching',
  templateUrl: './matching.component.html',
  styleUrls: ['./matching.component.css'],
  providers: [DbEntityMarkerService, SourceLocationMatchingService, MapService]
})
export class MatchingComponent implements OnInit, OnDestroy {

  // Mapping
  recordMapLayer: StoreSourceLayer;

  // StoreSource to-do list
  records: StoreSource[];

  autoMatch = false;
  showUnmatched = true;
  showMatched = false;
  showNonMatches = true;

  fileName: string;
  fileData: any[];
  fieldForm: FormGroup;
  fields: string[];

  subscriptions: Subscription[] = [];

  constructor(
    private mapService: MapService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dbEntityMarkerService: DbEntityMarkerService,
    private casingProjectService: CasingProjectService,
    private lms: SourceLocationMatchingService,
    private selectionService: EntitySelectionService
  ) {
  }

  ngOnInit() {
    this.createControlsForm();
    this.initListeners();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.dbEntityMarkerService.destroy();
  }

  getCurrentRecord() {
    return this.lms.storeSource;
  }

  noMatch() {
    this.lms.storeSource.store = new SimplifiedStore({id: 0});
    this.nextRecord();
  }

  matchStore(storeId: number) {
    if (this.lms.storeSource) {
      this.lms.storeSource.store = new SimplifiedStore({id: storeId});
      this.nextRecord();
    }
  }

  nextRecord() {
    const records = this.getRecords();
    const index = records.indexOf(this.lms.storeSource);
    if (index + 1 < records.length) {
      this.setCurrentRecord(records[index + 1]);
    }
  }

  setCurrentRecord(storeSource: StoreSource) {
    this.lms.setStoreSource(storeSource);

    const sd = storeSource.storeSourceData;
    if (sd) {
      const coords = {lat: sd.latitude, lng: sd.longitude};
      this.mapService.setCenter(coords);
      this.mapService.setZoom(15);
      this.recordMapLayer.setPin(coords, false);
    } else {
      this.snackBar.open('Store Source does\'t have a latitude and longitude!', null, {duration: 3000});
    }
  }

  onMapReady() {
    this.recordMapLayer = new StoreSourceLayer(this.mapService);

    const listener = (selection) => {
      if (selection.storeId) {
        this.matchStore(selection.storeId);
      }
    };

    this.dbEntityMarkerService.initMap(this.mapService.getMap(), listener, this.selectionService, this.casingProjectService);

    const markersChangedListener = this.dbEntityMarkerService.visibleMarkersChanged$.subscribe(() => {
      const siteMarkers = this.dbEntityMarkerService.getVisibleSiteMarkers();
      this.lms.setSiteMarkers(siteMarkers);
      if (this.autoMatch) {
        if (this.lms.bestMatch) {
          this.matchStore(this.lms.bestMatch.store.id);
        } else {
          this.noMatch();
        }
      }
    });

    const boundsChangedListener = this.mapService.boundsChanged$.pipe(this.getDebounce()).subscribe(() => {
      if (this.lms.storeSource && this.dbEntityMarkerService.controls.updateOnBoundsChange) {
        if (this.mapService.getZoom() >= this.dbEntityMarkerService.controls.minPullZoomLevel) {
          this.dbEntityMarkerService.getMarkersInMapView()
        } else {
          this.snackBar.open('Zoom in or change Pull zoom limit', null, {duration: 3000});
        }
      }
    });

    this.subscriptions.push(markersChangedListener);
    this.subscriptions.push(boundsChangedListener);
  }

  private getDebounce() {
    return debounce(() => of(true)
      .pipe(delay(1000)));
  }

  handleFile(fileObj) {
    this.records = null;
    this.lms.setStoreSource(null);

    const results = papa.parse(fileObj.fileOutput, {header: true, dynamicTyping: true, skipEmptyLines: true});
    this.fileName = fileObj.file.name;
    this.fileData = results.data;
    this.fields = results.meta.fields;

    const storeField = this.fields.find(field => field.toLowerCase() === 'store name' || field.toLowerCase() === 'store_name');
    if (storeField) {
      this.fieldForm.get('storeName').setValue(storeField);
    }

    const latitudeField = this.fields.find(field => field.toLowerCase() === 'latitude' || field.toLowerCase() === 'lat');
    if (latitudeField) {
      this.fieldForm.get('latitude').setValue(latitudeField);
    }

    const longitudeField = this.fields.find(field => {
      const lowerField = field.toLowerCase();
      return lowerField.toLowerCase() === 'longitude' || lowerField.toLowerCase() === 'lng' || lowerField.toLowerCase() === 'lon';
    });
    if (longitudeField) {
      this.fieldForm.get('longitude').setValue(longitudeField);
    }
  }

  loadRecords() {
    this.records = this.fileData.map(record => new StoreSource({
        sourceNativeId: record[this.fieldForm.get('uniqueId').value],
        sourceStoreName: record[this.fieldForm.get('storeName').value],
        storeSourceData: new StoreSourceData({
          latitude: record[this.fieldForm.get('latitude').value],
          longitude: record[this.fieldForm.get('longitude').value]
        })
      })
    );
    this.setCurrentRecord(this.records[0]);
  }

  downloadMatchedData() {
    this.fileData.forEach(record => {
      const mRecord = this.records.find(r => r.sourceNativeId === record[this.fieldForm.get('uniqueId').value]);
      if (mRecord && mRecord.store) {
        record['mtn_store_id'] = mRecord.store.id;
      }
    });
    const csv = papa.unparse(this.fileData);

    const fileName = this.fileName.replace(/\.[^/.]+$/, '') + '_matched.csv';

    const blob = new Blob([csv], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    a.target = '_blank';
    a.click();
    a.remove();
  }

  getRecords() {
    return this.records.filter(record =>
      (record.store && record.store.id > 0 && this.showMatched) ||
      (record.store && record.store.id === 0 && this.showNonMatches) ||
      (!record.store && this.showUnmatched)
    );
  }

  private initListeners() {
    const matchStore = this.lms.matchStore$.subscribe(storeId => this.matchStore(storeId));
    const noMatch = this.lms.noMatch$.subscribe(() => this.noMatch());
    this.subscriptions.push(matchStore);
    this.subscriptions.push(noMatch);
  }

  private createControlsForm() {
    this.fieldForm = this.fb.group({
      uniqueId: 'id',
      storeName: 'storeName',
      latitude: 'latitude',
      longitude: 'longitude'
    });
  }

}
