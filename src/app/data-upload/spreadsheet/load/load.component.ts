import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';

// services
import { SpreadsheetService } from '../spreadsheet.service';
import { StorageService } from 'app/core/services/storage.service';

@Component({
    selector: 'mds-load',
    templateUrl: './load.component.html',
    styleUrls: [ './load.component.css' ]
})
export class LoadComponent implements OnInit {
    file: File;
    fileOutput: string;

    fields: string[] = [];

    allowedFileTypes = '.csv,.json,.xls,.xlsx';
    outputType = 'text';

    storedProjects;

    continueFromProgress = false;

    localStorageKey = 'spreadsheets';

    constructor(
        public dialogRef: MatDialogRef<LoadComponent>,
        public spreadsheetService: SpreadsheetService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        public storageService: StorageService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.storedProjects = data.storedProjects;
        dialogRef.disableClose = true;
    }

    ngOnInit() {}

    close(): void {
        this.dialogRef.close();
    }

    handleFile(file): void {
        // triggers on read event of fileInput component
        const type = file.file.type;
        if (type === 'application/json') {
            // allows user to drop in json obj to share saved states between computers
            const storageItem = JSON.parse(file.fileOutput);

            this.storageService
                .import(this.localStorageKey, storageItem, true, this.getNewProjectId())
                .then((success) => {
                    // we imported it to local memory, now we need to update the list of stored projects with it
                    this.storageService.getOne(this.localStorageKey).then((item) => {
                        this.storedProjects = item ? item : {};
                        this.showProjects();
                    });
                })
                .catch((err) => {
                    this.snackBar.open('Could not load any stored projects! :(', null, { duration: 5000 });
                });
        } else {
            // read as spreadsheet
            const fields = this.spreadsheetService.getFields(file.fileOutput);
            if (this.fields) {
                this.spreadsheetService.setFile(file.file, file.fileOutput, fields);
                this.spreadsheetService.assignLoadType('file');

                this.close();
            } else {
                this.snackBar.open('Couldnt Find Fields...', null, { duration: 5000 });
            }
        }
    }

    removeStoredProject(id): void {
        const answer = confirm(
            `Are You Sure You Want To Delete '${this.storedProjects[id].name}'? This Can't Be Undone.`
        );
        if (answer) {
            delete this.storedProjects[id];
            this.storageService.set(this.localStorageKey, this.storedProjects).then((r) => {
                this.snackBar.open('Deleted Stored Item', null, { duration: 2000 });
            });
        }
    }

    getNewProjectId(): number {
        // looks at all the storedProject keys and creates a new one, ex --> if max key is 12, new will be 13
        return Object.keys(this.storedProjects).length
            ? Math.max.apply(null, Object.keys(this.storedProjects).map((key) => Number(key))) + 1
            : 0;
    }

    shareStoredProject(id): void {
        // exports a storageItem as a json file
        this.storageService.export(this.localStorageKey, true, id);
    }

    loadStoredProject(id): void {
        // populates app from a storageItem
        this.spreadsheetService.setStoredProjectId(id);
        this.spreadsheetService.assignLoadType('savedProject');
        this.close();
    }

    getStoredProjectsAsArray(): object[] {
        // gets list of storageItems for HTML list
        return Object.keys(this.storedProjects)
            .map((id) => {
                const data = this.storedProjects[id];
                return { id, data };
            })
            .sort((a: any, b: any) => {
                const date1 = new Date(b.data.lastEdited);
                const date2 = new Date(a.data.lastEdited);
                return Number(date1) - Number(date2);
            });
    }

    getProjectStatus(id): string {
        // storageItem metadata for HTML
        const allRecords = this.storedProjects[id].records.length.toLocaleString();
        const finished = this.storedProjects[id].records.filter((r) => r.validated).length.toLocaleString();
        return `${finished} / ${allRecords} Finished`;
    }

    showProjects(): void {
        this.continueFromProgress = true;
    }
}
