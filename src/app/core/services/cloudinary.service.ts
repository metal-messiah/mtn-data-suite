import { EventEmitter, Injectable } from '@angular/core';

import shajs from 'sha.js';
import { CloudinaryAsset } from '../../shared/cloudinary/CloudinaryAsset';

declare var cloudinary: any;

@Injectable()
export class CloudinaryService {

  private cloudinaryInstance: any;
  private currentApiKey: string;

  constructor() { }

  initialize(params: {cloudName: string, username: string, apiSecret: string, apiKey: string, multiple: boolean, maxFiles?: number},
             assetCallback: (assets) => void) {
    // Only recreate the instance if it is a different one
    if (!this.cloudinaryInstance || this.currentApiKey !== params.apiKey) {
      this.currentApiKey = params.apiKey;

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
        insertHandler: (data) => assetCallback(data.assets.map(a => new CloudinaryAsset(a)))
      });
    }
  }

  show() {
    this.cloudinaryInstance.show();
  }
}
