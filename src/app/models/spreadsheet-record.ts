import { Coordinates } from './coordinates';
import { SimplifiedStore } from './simplified/simplified-store';
import { CompanyService } from 'app/core/services/company.service';
import { Type } from '@angular/compiler/src/core';
import { SimplifiedCompany } from './simplified/simplified-company';
import { Banner } from './full/banner';
import { FieldMappingItem } from 'app/data-upload/spreadsheet/assign-fields-dialog/field-mapping-item';

export class SpreadsheetRecord {
    readonly uniqueId: any;
    readonly coordinates: Coordinates;
    readonly displayName: string;

    matchedStore: SimplifiedStore;
    noMatch = false;

    validated = false;

    readonly attributes: any;

    companyService: CompanyService;

    assignments: {
        lat: string;
        lng: string;
        name: string;
        company: SimplifiedCompany;
        banner: Banner;
        storeNumber: string;
        matchType: string;
        updateFields: FieldMappingItem[];
        insertFields: FieldMappingItem[];
    };

    constructor(
        uniqueId: any,
        latitude: number,
        longitude: number,
        displayName?: string,
        attributes?: object,
        assignments?: any,
        validated?: boolean
    ) {
        this.uniqueId = uniqueId;
        this.coordinates = {
            lat: latitude,
            lng: longitude
        };

        this.displayName = displayName;
        this.attributes = attributes;
        this.assignments = assignments;
        this.validated = validated ? validated : false;
    }

    addAttribute(key: string, value: any) {
        this.attributes[key] = value;
    }

    getAttribute(key) {
        return this.attributes[key];
    }

    getUpdateFields() {
        return Object.assign([], this.assignments.updateFields);
    }

    getInsertFields() {
        return Object.assign([], this.assignments.insertFields);
    }

    setValidated(validated: boolean) {
        this.validated = validated;
    }
}
