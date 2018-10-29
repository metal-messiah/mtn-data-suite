export class FieldMappingItem {
  id: number;
  storeFields: string[];
  fileFields: string[];

  selectedFileField: string;
  selectedStoreField: string;

  constructor(fileFields) {
    this.id = Number(new Date());

    this.storeFields = [
      'storeName',
      'storeNumber',
      'storeType',
      'dateOpened',
      'dateClosed',
      'fit',
      'format',
      'areaSales',
      'areaSalesPercentOfTotal',
      'areaTotal',
      'areaIsEstimate',
      'storeIsOpen24',
      'naturalFoodsAreIntegrated',
      'floating',
      'storeVolumes'
    ];

    this.fileFields = Object.assign([], fileFields);

    this.selectedFileField = null;
    this.selectedStoreField = null;
  }
}
