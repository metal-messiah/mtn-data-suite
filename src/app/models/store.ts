import { AuditingEntity } from './auditing-entity';
import { Banner } from './banner';

export class Store extends AuditingEntity {
  private _id: number;
  private _storeName: string;
  private _storeType: string;
  private _dateOpened: Date;
  private _dateClosed: Date;
  private _storeNumber: string;
  private _legacyLocationId: number;
  private _banner: Banner;
  private _bannerName: string;
  private _latestSalesArea: number;
  private _latestTotalArea: number;
  private _latestVolume: number;
  private _latestVolumeDate: Date;
  private _currentStoreStatus: string;

  constructor(obj: Store) {
    super(obj);
    Object.keys(obj).forEach(key => this[key] = obj[key]);
  }


  get id(): number {
    return this._id;
  }

  get storeName(): string {
    return this._storeName;
  }

  get storeType(): string {
    return this._storeType;
  }

  get dateOpened(): Date {
    return this._dateOpened;
  }

  get dateClosed(): Date {
    return this._dateClosed;
  }

  get storeNumber(): string {
    return this._storeNumber;
  }

  get legacyLocationId(): number {
    return this._legacyLocationId;
  }

  get banner(): Banner {
    return this._banner;
  }

  get bannerName(): string {
    if (this._bannerName != null) {
      return this._bannerName;
    } else if (this._bannerName != null) {
      return this._banner.bannerName;
    }
    return null;
  }

  get latestSalesArea(): number {
    return this._latestSalesArea;
  }

  get latestTotalArea(): number {
    return this._latestTotalArea;
  }

  get latestVolume(): number {
    return this._latestVolume;
  }

  get latestVolumeDate(): Date {
    return this._latestVolumeDate;
  }

  get currentStoreStatus(): string {
    return this._currentStoreStatus;
  }

  getLabel() {
    let label = null;
    if (this._bannerName != null) {
      label = this._bannerName;
    } else {
      label = this._storeName;
    }
    if (this._storeNumber != null) {
      label = `${label} (${this._storeNumber})`;
    }
    return label;
  }

  set id(value: number) {
    this._id = value;
  }

  set storeName(value: string) {
    this._storeName = value;
  }

  set storeType(value: string) {
    this._storeType = value;
  }

  set dateOpened(value: Date) {
    this._dateOpened = value;
  }

  set dateClosed(value: Date) {
    this._dateClosed = value;
  }

  set storeNumber(value: string) {
    this._storeNumber = value;
  }

  set legacyLocationId(value: number) {
    this._legacyLocationId = value;
  }

  set banner(value: Banner) {
    this._banner = value;
  }

  set bannerName(value: string) {
    this._bannerName = value;
  }

  set latestSalesArea(value: number) {
    this._latestSalesArea = value;
  }

  set latestTotalArea(value: number) {
    this._latestTotalArea = value;
  }

  set latestVolume(value: number) {
    this._latestVolume = value;
  }

  set latestVolumeDate(value: Date) {
    this._latestVolumeDate = value;
  }

  set currentStoreStatus(value: string) {
    this._currentStoreStatus = value;
  }
}
