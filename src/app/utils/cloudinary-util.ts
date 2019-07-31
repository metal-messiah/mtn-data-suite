import { EventEmitter } from '@angular/core';

import shajs from 'sha.js';
import { CloudinaryAsset } from '../shared/cloudinary/CloudinaryAsset';

declare var cloudinary: any;

export class CloudinaryUtil {

  private readonly defaultCloudinaryParams = {
    cloudName: 'mtn-retail-advisors',
    username: 'tyler@mtnra.com',
    apiSecret: 'OGQKRd95GxzMrn5d7_D6FOd7lXs',
    apiKey: '713598197624775',
    multiple: true,
    maxFiles: 1
  };

  private readonly DEFAULT_HEIGHT_LIMIT = 40;
  private readonly DEFAULT_WIDTH_LIMIT = 100;

  private readonly cloudinaryInstance: any;
  private readonly currentApiKey: string;
  private readonly cloudName: string;

  assetSelected$ = new EventEmitter<CloudinaryAsset>();

  constructor(assetHandler?: (assets: CloudinaryAsset[]) => void,
              params?: { cloudName: string, username: string, apiSecret: string, apiKey: string, multiple: boolean, maxFiles?: number }) {
    if (!params) {
      params = this.defaultCloudinaryParams;
    }

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
        insertHandler: (data) => {
          if (assetHandler) {
            assetHandler(data.assets.map(a => new CloudinaryAsset(a)));
          }
        }
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
