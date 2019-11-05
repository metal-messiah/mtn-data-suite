import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { saveAs } from 'file-saver';
import { CloudinaryAsset } from '../../shared/cloudinary/CloudinaryAsset';
import { CloudinaryUtil } from '../../utils/cloudinary-util';

import * as papa from 'papaparse';
import { ParseResult } from 'papaparse';
import { ClipboardUtil } from '../../utils/clipboard-util';

@Component({
  selector: 'mds-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.css']
})
export class ImagesComponent implements OnInit {
  private readonly cloudinaryParams = {
    cloudName: 'REDACTED',
    username: 'REDACTED',
    apiSecret: 'REDACTED',
    apiKey: 'REDACTED',
    multiple: false
  };

  parsedFile: ParseResult;
  originalFileName: string;

  headers: string[];

  chainIdentifyingHeader: string;
  chainLogos: any = {};

  private readonly cloudinaryUtil: CloudinaryUtil;

  constructor(private snackBar: MatSnackBar) {
    this.cloudinaryUtil = new CloudinaryUtil(this.handleAssetSelection, this.cloudinaryParams);
  }

  ngOnInit() {
  }

  handleAssetSelection(assets: CloudinaryAsset[]) {
    const filename = `${assets[0].public_id}.${assets[0].format}`;
    ClipboardUtil.copyValueToClipboard(filename);
    this.snackBar.open(`Filename copied to clipboard: ${filename}`, null, {duration: 2000});
  }

  openCloudinary() {
    this.cloudinaryUtil.show();
  }

  selectImageForChain(chain: string) {
    const subscription = this.cloudinaryUtil.assetSelected$.subscribe((assets: CloudinaryAsset[]) => {
      subscription.unsubscribe();
      this.chainLogos[chain] = `${assets[0].public_id}.${assets[0].format}`;
    });
    this.cloudinaryUtil.show();
  }

  getImgUrl(fileName: string) {
    return this.cloudinaryUtil.getUrlForLogoFileName(fileName);
  }

  readCsv(fileObj) {
    this.originalFileName = fileObj.file.name;
    this.parsedFile = papa.parse(fileObj.fileOutput, {header: true, dynamicTyping: true, skipEmptyLines: true});
    this.headers = this.parsedFile.meta.fields;
  }

  identifyingColumnChange(event) {
    this.chainIdentifyingHeader = event.value;
    this.chainLogos = {};

    this.parsedFile.data.forEach(record => {
      const value = record[this.chainIdentifyingHeader];
      this.chainLogos[value] = null;
    });
  }

  getChainNames() {
    return Object.keys(this.chainLogos);
  }

  exportNewCsv() {
    this.parsedFile.data.forEach(record => {
      const chain = record[this.chainIdentifyingHeader];
      record['logo'] = this.chainLogos[chain];
    });

    const csv = papa.unparse(this.parsedFile.data);

    saveAs(
      new Blob([csv]),
      `${this.originalFileName.split('.')[0] + '_logos'}.csv`
    );
  }

}
