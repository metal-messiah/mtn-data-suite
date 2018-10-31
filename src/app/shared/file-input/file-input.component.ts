import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'mds-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.css']
})
export class FileInputComponent implements OnInit {
  @Input()
  fileTypes = '*'; // file_extension|audio/*|video/*|image/*|media_type
  @Input()
  outputType = 'text'; // text, dataUrl, buffer, binary
  @Input()
  disabled = false;
  @Input()
  buttonText = 'Upload File'
  @Output()
  fileChanged = new EventEmitter();

  parseLogic;
  file: File;
  fileReader: FileReader;
  snackBar: MatSnackBar;

  constructor(snackBar: MatSnackBar) {
    this.fileReader = new FileReader();
  }

  ngOnInit() {}

  resetFile() {
    this.file = null;
  }

  readFile(event) {
    
    // console.log(this.outputType);
    
    this.resetFile();

    const files = event.target.files;

    if (files && files.length === 1) {
      // only want 1 file at a time!

      this.file = files[0];
      this.fileReader.onload = () => {
        // console.log(this.fileReader.result);
        if (this.fileReader.result) {
          this.fileChanged.emit({
            file: this.file,
            fileOutput: this.fileReader.result
          });
        } else {
          this.snackBar.open('Error Reading file! No result!', null, {
            duration: 5000
          });
        }
      };

      this.fileReader.onerror = error =>
        this.snackBar.open(error.toString(), null, { duration: 2000 });

      // Trigger FileReader.onload
      if (this.outputType === 'text') {
        this.fileReader.readAsText(this.file);
      }
      if (this.outputType === 'dataUrl') {
        this.fileReader.readAsDataURL(this.file);
      }
      if (this.outputType === 'buffer') {
        this.fileReader.readAsArrayBuffer(this.file);
      }
      if (this.outputType === 'binary') {
        this.fileReader.readAsBinaryString(this.file);
      }
    } else {
      // notify about file constraints
      this.snackBar.open('1 file at a time please', null, { duration: 2000 });
    }
  }
}
