import { SpreadsheetRecord } from 'app/models/spreadsheet-record';

export class StoredProject {
    records: SpreadsheetRecord[];
    name: string;
    lastEdited: Date;
    volumeRules: {
        volumeDate: string;
        volumeType: string;
    };

    constructor(
        name: string,
        records: SpreadsheetRecord[],
        volumeRules: {
            volumeDate: string;
            volumeType: string;
        }
    ) {
        this.name = name;
        this.records = records;
        this.lastEdited = new Date();

        this.volumeRules = volumeRules;
    }
}
