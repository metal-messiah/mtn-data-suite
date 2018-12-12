import { SpreadsheetRecord } from 'app/models/spreadsheet-record';
import { Store } from 'app/models/full/store';

export class AutomatchItem {
	record: SpreadsheetRecord;
	dbRecord: Store;
	logic: {
		inserts: object;
		updates: object;
		volumeRules: object;
	};
	forcedSubmit: boolean;

	constructor(record, dbRecord, logic) {
		this.record = record;
		this.dbRecord = dbRecord;
		this.logic = logic;
		this.forcedSubmit = false;
	}
}
