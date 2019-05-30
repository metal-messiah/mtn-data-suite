import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import shajs from 'sha.js';
declare var cloudinary: any;

export class CloudinaryAsset {
  bytes: number;
  created_at: string;
  duration: number;
  format: string;
  height: number;
  public_id: string;
  resource_type: string;
  secure_url: URL;
  tags: string[];
  type: string;
  url: URL;
  version: number;
  width: number;

  constructor(asset) {
    Object.assign(this, asset);
  }
}

export interface CloudinaryConfig {
  signature: string;
  cloud_name: string;
  api_key: string;
  username: string;
  timestamp: number;
  max_files: number;
  multiple: boolean;
};

@Component({
  selector: 'mds-cloudinary',
  templateUrl: './cloudinary.component.html',
  styleUrls: ['./cloudinary.component.css']
})
export class CloudinaryComponent implements OnInit {
  @Input() cloudName: string; // 'mtn-retail-advisors';
  @Input() username: string; // 'tyler@mtnra.com';
  @Input() apiSecret: string; // = 'OGQKRd95GxzMrn5d7_D6FOd7lXs';
  @Input() apiKey: string; // = '713598197624775';
  @Input() maxFiles = 100;
  @Input() multiple = true;

  @Output() assets = new EventEmitter<CloudinaryAsset[]>();

  timeStamp = Math.floor(Date.now() / 1000);
  cloudinaryConfig: CloudinaryConfig;

  mediaLibrary: any;

  constructor() { }

  ngOnInit() {
    const signature = `cloud_name=${this.cloudName}&timestamp=${this.timeStamp}&username=${this.username}${this
      .apiSecret}`;
    const encodedSignature = shajs('sha256').update(signature).digest('hex');

    this.cloudinaryConfig = {
      signature: encodedSignature,
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      username: this.username,
      timestamp: this.timeStamp,
      max_files: this.maxFiles,
      multiple: this.multiple
    };

    this.openCloudinary();
  }

  openCloudinary() {
    cloudinary.openMediaLibrary(this.cloudinaryConfig, {
      insertHandler: (data) => {
        // do nothing for now
        this.assets.emit(data.assets.map(a => new CloudinaryAsset(a)));
      }
    });
  }
}
