import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatStepper, MatDialog, MatSnackBar } from '@angular/material';
import { SpreadsheetService } from '../spreadsheet.service';
import { AssignFieldsDialogComponent } from '../assign-fields-dialog/assign-fields-dialog.component';
import { StoredProject } from '../storedProject';
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

	allowedFileTypes = '.csv';
	outputType = 'text';

	storedProjects;

	continueFromProgress = false;

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

		const fields = this.spreadsheetService.getFields(file.fileOutput);
		if (this.fields) {
			this.spreadsheetService.setFile(file.file, file.fileOutput, fields);
			this.spreadsheetService.assignLoadType('file');

			this.close();
		} else {
			this.snackBar.open('Couldnt Find Fields...');
		}
	}

	removeStoredProject(id) {
		const answer = confirm(
			`Are You Sure You Want To Delete '${this.storedProjects[id].name}'? This Can't Be Undone.`
		);
		if (answer) {
			delete this.storedProjects[id];
			this.storageService.setLocalStorage('spreadsheets', this.storedProjects, true);
		}
	}

	loadStoredProject(id) {
		this.spreadsheetService.setStoredProjectId(id);
		this.spreadsheetService.assignLoadType('savedProject');
		this.close();
	}

	getStoredProjectsAsArray() {
		return Object.keys(this.storedProjects).map((id) => {
			const data = this.storedProjects[id];
			return { id, data };
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
