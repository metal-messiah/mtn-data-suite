export interface Location {
  coordinates: number[];
}

export interface Mappable {
  location: Location;
  getCoordinates: () => number[];
  getLabel: () => string;
  getId: () => number;
}
