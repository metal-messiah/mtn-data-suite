export class StoreSourceData {

  shoppingCenterName: string;
  address: string;
  city: string;
  county: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;

  dateOpened: string;
  storeStatus: string;
  areaTotal: number;
  areaIsActual: boolean;

  constructor(obj?) {
    Object.assign(this, obj);
  }
}
