import { EventEmitter, Injectable } from '@angular/core';

import shajs from 'sha.js';
import { CloudinaryAsset } from '../../shared/cloudinary/CloudinaryAsset';

declare var cloudinary: any;

@Injectable()
export class CloudinaryService {

  private readonly DEFAULT_HEIGHT_LIMIT = 40;
  private readonly DEFAULT_WIDTH_LIMIT = 100;

  private cloudinaryInstance: any;
  private currentApiKey: string;
  private cloudName: string;

  assetSelected$ = new EventEmitter<CloudinaryAsset>();

  constructor() { }

  initialize(params: {cloudName: string, username: string, apiSecret: string, apiKey: string, multiple: boolean, maxFiles?: number}) {
    // Only recreate the instance if it is a different one
    if (!this.cloudinaryInstance || this.currentApiKey !== params.apiKey) {
      this.currentApiKey = params.apiKey;
      this.cloudName = params.cloudName;

      const timeStamp = Math.floor(Date.now() / 1000);

      const signature = `cloud_name=${params.cloudName}&timestamp=${timeStamp}&username=${params.username}${params.apiSecret}`;
      const encodedSignature = shajs('sha256').update(signature).digest('hex');

      const cloudinaryConfig = {
        signature: encodedSignature,
        cloud_name: params.cloudName,
        api_key: params.apiKey,
        username: params.username,
        timestamp: timeStamp,
        max_files: params.maxFiles || 100,
        multiple: params.multiple
      };

      this.cloudinaryInstance = cloudinary.createMediaLibrary(cloudinaryConfig, {
        insertHandler: (data) => this.assetSelected$.next(data.assets.map(a => new CloudinaryAsset(a)))
      });
    }
  }

  show() {
    this.cloudinaryInstance.show();
  }

  getUrlForLogoFileName(logoFileName: string, heightLimit?: number, widthLimit?: number): string {
    const h = heightLimit ? heightLimit : this.DEFAULT_HEIGHT_LIMIT;
    const w = widthLimit ? widthLimit : this.DEFAULT_WIDTH_LIMIT;
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/c_limit,h_${h},w_${w}/${logoFileName}`;
  }
}
