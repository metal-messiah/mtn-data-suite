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
			'areaSales',
			'areaSalesPercentOfTotal',
			'areaTotal',
			'areaIsEstimate',
			'storeVolumes',

			'address',
			'city',
			'county',
			'state',
			'postalCode',
			'quad',
			'intersectionStreetPrimary',
			'intersectionStreetSecondary',
			'floating',
			'naturalFoodsAreIntegrated',
			'storeIsOpen24'
		].sort();

		this.fileFields = Object.assign([], fileFields);

		this.selectedFileField = null;
		this.selectedStoreField = null;
	}
}
