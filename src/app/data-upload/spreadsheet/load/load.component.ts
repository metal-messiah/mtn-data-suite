import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
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

	allowedFileTypes = '.csv,.json';
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
	}

	ngOnInit() {}

	close() {
		this.dialogRef.close();
	}

	handleFile(file) {
		console.log('handle file');
		const type = file.file.type;
		if (type === 'application/json') {
			const storageItem = JSON.parse(file.fileOutput);
			this.storageService
				.importLocalStorage(this.localStorageKey, storageItem, true, this.getNewProjectId())
				.then((success) => {
					// we imported it to local memory, now we need to update the list of stored projects with it
					this.storageService.getLocalStorage(this.localStorageKey, true).subscribe((item) => {
						this.storedProjects = item ? item : {};
						this.showProjects();
					});
				});
		} else {
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

	removeStoredProject(id) {
		const answer = confirm(
			`Are You Sure You Want To Delete '${this.storedProjects[id].name}'? This Can't Be Undone.`
		);
		if (answer) {
			delete this.storedProjects[id];
			this.storageService.setLocalStorage(this.localStorageKey, this.storedProjects, true);
		}
	}

	getNewProjectId() {
		console.log('get new project id');
		return Object.keys(this.storedProjects).length
			? Math.max.apply(null, Object.keys(this.storedProjects).map((key) => Number(key))) + 1
			: 0;
	}

	shareStoredProject(id) {
		this.storageService.exportLocalStorage(this.localStorageKey, true, id);
	}

	loadStoredProject(id) {
		this.spreadsheetService.setStoredProjectId(id);
		this.spreadsheetService.assignLoadType('savedProject');
		this.close();
	}

	getStoredProjectsAsArray() {
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

	getProjectStatus(id) {
		// console.log(id);
		const allRecords = this.storedProjects[id].records.length.toLocaleString();
		const finished = this.storedProjects[id].records.filter((r) => r.validated).length.toLocaleString();
		return `${finished} / ${allRecords} Finished`;
	}

	showProjects() {
		this.continueFromProgress = true;
	}
}
