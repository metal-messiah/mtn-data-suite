import { Component, OnInit } from '@angular/core';
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

  constructor() {
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

  ngOnInit() {}

  getValue(item) {
    return `${item.public_id}.${item.format}`;
  }

  copyToClipboard(id) {
    const target: any = document.getElementById(id);

    /* Select the text field */
    target.select();

    /* Copy the text inside the text field */
    document.execCommand('copy');
    this.copiedId = id;
    this.clearTextSelection();
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

  getImageDimensions(img) {
    console.log(img);
    // const scale =
    //   this.naturalHeight > 100
    //     ? this.naturalHeight / 100
    //     : this.naturalWidth > 120
    //       ? this.naturalWidth / 120
    //       : 1;
    // const width = Math.round(this.naturalWidth / scale);
    // const height = Math.round(this.naturalHeight / scale);
    // console.log({width, height})
    // return {width, height}
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
    console.log(files);
    this.selectedFiles = files;
  }

  // insertHandler(data) {
  //   this.selectedFiles = data.assets;
  // }
}
