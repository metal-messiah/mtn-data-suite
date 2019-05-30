import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';

import { saveAs } from 'file-saver';
import shajs from 'sha.js';
import { CloudinaryAsset } from 'app/shared/cloudinary/cloudinary.component';

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

  selectedFiles: CloudinaryAsset[] = [];
  copiedId: string;

  file: File;
  fileReader: FileReader;
  csvAsString: string;
  csvFields: string[];
  csvArray: any[];

  identifier: string;
  identifierTargets: object = {};
  identifierIdx: number;

  showCloudinary = false;

  constructor(private snackBar: MatSnackBar) {
    this.fileReader = new FileReader();
    this.fileReader.onload = event => this.handleFileContents(event); // desired file content
    this.fileReader.onerror = error =>
      this.snackBar.open(error.toString(), null, {
        duration: 2000
      });

  }

  ngOnInit() {
    this.openCloudinary();
  }

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

  handleAssets(assets) {
    this.setSelectedFiles(assets);
    this.showCloudinary = false;
  }

  openCloudinary() {
    this.selectedFiles = [];
    this.showCloudinary = true;
    if (!this.cloudinaryIsShowing()) {
      setTimeout(() => {
        this.setCloudinaryElementVisibility('visible');
      }, 500)
    }
  }

  cloudinaryIsShowing() {
    const cloudinaryElem = document.querySelector('div>iframe');
    let isShowing = false;
    if (cloudinaryElem) {
      isShowing = cloudinaryElem.parentElement.style.visibility === 'visible';
    }
    return isShowing;
  }

  setCloudinaryElementVisibility(visibility) {
    const cloudinaryElem = document.querySelector('div>iframe');
    if (cloudinaryElem) {
      cloudinaryElem.parentElement.style.visibility = visibility
    }
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
    });

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

  setSelectedFiles(files: CloudinaryAsset[]) {
    this.selectedFiles = files;
  }
}
