import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';

import { saveAs } from 'file-saver';
import shajs from 'sha.js';
declare var cloudinary: any;

@Component({
  selector: 'mds-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.css']
})
export class ImagesComponent implements OnInit {
  cloudName = 'mtnra';
  timeStamp = Math.floor(Date.now() / 1000);
  username = 'jordan@mtnra.com';
  apiSecret = 'wClRfg43OFsvwhg33QMnowZ0Skc';
  apiKey = '515812459374857';

  config: object;

  signature: string;
  encodedSignature: string;

  mediaLibrary: any;

  selectedFiles;
  copiedId: string;

  initialized = false;

  file: File;
  fileReader: FileReader;
  csvAsString: string;
  csvFields: string[];
  csvArray: any[];

  identifier: string;
  identifierTargets: object = {};
  identifierIdx: number;

  constructor(private snackBar: MatSnackBar) {
    this.fileReader = new FileReader();
    this.fileReader.onload = event => this.handleFileContents(event); // desired file content
    this.fileReader.onerror = error =>
      this.snackBar.open(error.toString(), null, {
        duration: 2000
      });
    // window['global'] = window;
    this.signature = `cloud_name=${this.cloudName}&timestamp=${
      this.timeStamp
      }&username=${this.username}${this.apiSecret}`;

    this.encodedSignature = shajs('sha256')
      .update(this.signature)
      .digest('hex');

    this.config = {
      signature: this.encodedSignature,
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      username: this.username,
      timestamp: this.timeStamp,
      max_files: 100
    };

    this.openCloudinary();

    this.selectedFiles = [];
  }

  ngOnInit() { }

  getValue(item) {
    return `${item.public_id}.${item.format}`;
  }

  copyToClipboard(id) {
    const target: any = document.getElementById(id);

    target.disabled = false;
    /* Select the text field */
    target.select();

    /* Copy the text inside the text field */
    document.execCommand('copy');
    this.copiedId = id;
    this.clearTextSelection();
    target.disabled = true;
  }

  startOver() {
    this.initialized = false;
    this.selectedFiles = [];
    this.openCloudinary();
  }

  openCloudinary() {
    this.mediaLibrary = cloudinary.openMediaLibrary(this.config, {
      insertHandler: data => {
        this.setSelectedFiles(data.assets);
      }
    });

    setTimeout(() => {
      this.initialized = true;
    }, 5000);
  }

  readCsv(event) {
    const { files } = event.target;
    if (files && files.length === 1) {
      // only want 1 file at a time!
      this.file = files[0];
      if (this.file.name.includes('.csv')) {
        // just double checking that it is a .csv file
        this.fileReader.readAsText(this.file);
      } else {
        this.snackBar.open('Only valid .csv files are accepted', null, {
          duration: 2000
        });
      }
    } else {
      // notify about file constraints
      this.snackBar.open('1 file at a time please', null, { duration: 2000 });
    }
  }

  handleFileContents(event) {
    if (event.target.result) {
      this.csvAsString = event.target.result;
      this.csvArray = this.csvAsString.split('\r\n').map(row => row.split(','));

      if (this.csvAsString) {
        this.csvFields = this.getCSVHeaders();
      }
    }
  }

  getCSVHeaders() {
    return this.csvAsString.split('\r\n')[0].split(',');
  }

  identifierChange(event) {
    this.identifier = event.value;
    this.identifierTargets = {};

    this.identifierIdx = this.csvFields.findIndex(f => f === this.identifier);
    if (this.identifierIdx >= 0) {
      this.csvAsString.split('\r\n').forEach((row, i) => {
        if (i) {
          // skip the header row
          const idTarget = row.split(',')[this.identifierIdx];
          if (idTarget) {
            this.identifierTargets[idTarget] = '';
          }
        }
      });
    }
  }

  getIdentifierTargetNames() {
    return Object.keys(this.identifierTargets);
  }

  targetChange(event, name) {
    const prop = event.value;
    this.identifierTargets[prop] = name;
  }

  targetIsTaken(target) {
    return this.identifierTargets[target] !== '';
  }

  exportNewCsv() {
    let output = '';
    this.csvArray.forEach((row, i) => {
      output += row.join(',');
      if (!row.includes('logo') && i === 0) {
        output += ',logo'
      }
      if (i !== 0) {
        Object.keys(this.identifierTargets).forEach(key => {
          if (key === row[this.identifierIdx]) {
            output += ',' + this.identifierTargets[key]
          }
        })
      }
      output += '\r\n';
    })

    saveAs(
      new Blob([output]),
      `${
      this.file
        ? this.file.name.split('.')[0] + '_logos'
        : 'export_logos'
      }.csv`
    );
  }

  clearTextSelection() {
    let sel;
    if ((sel = document['selection']) && sel.empty) {
      sel.empty();
    } else {
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
      const activeEl: any = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.nodeName.toLowerCase();
        if (
          tagName === 'textarea' ||
          (tagName === 'input' && activeEl.type === 'text')
        ) {
          // Collapse the selection to the end
          activeEl.selectionStart = activeEl.selectionEnd;
        }
      }
    }
  }

  setSelectedFiles(files) {
    this.selectedFiles = files;
  }
}
