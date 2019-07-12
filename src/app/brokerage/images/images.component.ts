import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { saveAs } from 'file-saver';
import { CloudinaryAsset } from '../../shared/cloudinary/CloudinaryAsset';
import { CloudinaryService } from '../../core/services/cloudinary.service';

import * as papa from 'papaparse'
import { ParseResult } from 'papaparse'
import { ClipboardUtil } from '../../utils/clipboard-util';

@Component({
  selector: 'mds-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.css']
})
export class ImagesComponent implements OnInit {
  private cloudinaryParams = {
    cloudName: 'mtnra',
    username: 'jordan@mtnra.com',
    apiSecret: 'wClRfg43OFsvwhg33QMnowZ0Skc',
    apiKey: '515812459374857',
    multiple: false
  };

  parsedFile: ParseResult;
  originalFileName: string;

  headers: string[];

  chainIdentifyingHeader: string;
  chainLogos: any = {};

  constructor(private snackBar: MatSnackBar,
              private cloudinaryService: CloudinaryService) {
  }

  ngOnInit() {
    this.cloudinaryService.initialize(this.cloudinaryParams);
  }

  openCloudinary() {
    const subscription = this.cloudinaryService.assetSelected$.subscribe((assets: CloudinaryAsset[]) => {
      subscription.unsubscribe();
      const filename = `${assets[0].public_id}.${assets[0].format}`;
      ClipboardUtil.copyValueToClipboard(filename);
      this.snackBar.open(`Filename copied to clipboard: ${filename}`, null, {duration: 2000});
    });
    this.cloudinaryService.show();
  }

  selectImageForChain(chain: string) {
    const subscription = this.cloudinaryService.assetSelected$.subscribe((assets: CloudinaryAsset[]) => {
      subscription.unsubscribe();
      this.chainLogos[chain] = `${assets[0].public_id}.${assets[0].format}`;
    });
    this.cloudinaryService.show();
  }

  getImgUrl(fileName: string) {
    return this.cloudinaryService.getUrlForLogoFileName(fileName);
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
      this.chainLogos[value] = null
    });
  }

  getChainNames() {
    return Object.keys(this.chainLogos);
  }

  exportNewCsv() {
    this.parsedFile.data.forEach(record => {
      const chain = record[this.chainIdentifyingHeader];
      record['logo'] = this.chainLogos[chain]
    });

    const csv = papa.unparse(this.parsedFile.data);

    saveAs(
      new Blob([csv]),
      `${this.originalFileName.split('.')[0] + '_logos'}.csv`
    );
  }

}
