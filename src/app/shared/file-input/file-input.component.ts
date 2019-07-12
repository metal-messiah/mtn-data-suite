import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import { TabSelectDialogComponent } from './tab-select-dialog/tab-select-dialog.component';

@Component({
    selector: 'mds-file-input',
    templateUrl: './file-input.component.html',
    styleUrls: ['./file-input.component.css']
})
export class FileInputComponent implements OnInit {
    @Input() fileTypes = '*'; // file_extension|audio/*|video/*|image/*|media_type
    @Input() outputType = 'text'; // text, dataUrl, buffer, binary
    @Input() disabled = false;
    @Input() buttonText = 'Upload File';
    @Output() fileChanged = new EventEmitter();

    file: File;
    fileReader: FileReader;
    snackBar: MatSnackBar;

    constructor(snackBar: MatSnackBar, private dialog: MatDialog) {
        this.fileReader = new FileReader();
    }

    ngOnInit() { }

    resetFile() {
        this.file = null;
    }

    readFile(event) {
        this.resetFile();
        const files = event.target.files;

        if (files && files.length === 1) {
            // only want 1 file at a time!
            this.file = files[0];
            this.fileReader.onload = () => {
                if (this.fileReader.result) {
                    if (this.file.name.includes('.xls')) {
                        const wb: XLSX.WorkBook = XLSX.read(this.fileReader.result, {
                            type: 'binary'
                        });
                        const sheetNames = Object.keys(wb.Sheets);
                        const dialogRef = this.dialog.open(TabSelectDialogComponent, { data: { sheetNames } });
                        dialogRef.afterClosed().subscribe((selectedSheet) => {
                            Object.keys(wb.Sheets).forEach((key: string, i: number) => {
                                if (key === selectedSheet) {
                                    this.emit(
                                        this.file,
                                        XLSX.utils.sheet_to_csv(wb.Sheets[key]).replace(/\n/g, '\r\n')
                                    );
                                }
                            });
                        });
                    } else {
                        this.emit(this.file, this.fileReader.result);
                    }
                } else {
                    this.snackBar.open('Error Reading file! No result!', null, {
                        duration: 5000
                    });
                }
            };

            this.fileReader.onerror = (error) => this.snackBar.open(error.toString(), null, { duration: 2000 });

            // Trigger FileReader.onload
            if (this.outputType === 'binary' || this.file.name.includes('.xls')) {
                this.fileReader.readAsBinaryString(this.file);
            } else if (this.outputType === 'text') {
                this.fileReader.readAsText(this.file);
            } else if (this.outputType === 'dataUrl') {
                this.fileReader.readAsDataURL(this.file);
            } else if (this.outputType === 'buffer') {
                this.fileReader.readAsArrayBuffer(this.file);
            }
        } else {
            // notify about file constraints
            this.snackBar.open('1 file at a time please', null, { duration: 2000 });
        }
    }

    emit(file, fileOutput) {
        this.fileChanged.emit({ file, fileOutput });
    }
}
