import { Coordinates } from './coordinates';
import { SimplifiedStore } from './simplified/simplified-store';

export class SpreadsheetRecord {

  readonly uniqueId: any;
  readonly coordinates: Coordinates;
  readonly displayName: string;

  matchedStore: SimplifiedStore;
  noMatch = false;

  private readonly attributes: object;

  constructor(uniqueId: any, latitude: number, longitude: number, displayName?: string) {
    this.uniqueId = uniqueId;
    this.coordinates = {
      lat: latitude,
      lng: longitude
    };
    this.displayName = displayName;
    this.attributes = {};
  }

  addAttribute(key: string, value: any) {
    this.attributes[key] = value;
  }

  getAttribute(key) {
    return this.attributes[key];
  }

}
