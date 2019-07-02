import { Component, OnInit } from '@angular/core';

import shajs from 'sha.js';

declare var cloudinary: any;

@Component({
    selector: 'mds-cloudinary',
    templateUrl: './cloudinary.component.html',
    styleUrls: [ './cloudinary.component.css' ]
})
export class CloudinaryComponent implements OnInit {
    cloudName = 'mtn-retail-advisors';
    timeStamp = Math.floor(Date.now() / 1000);
    username = 'tyler@mtnra.com';
    apiSecret = 'OGQKRd95GxzMrn5d7_D6FOd7lXs';
    apiKey = '713598197624775';
    maxFiles = 100;

    cloudinaryConfig: {
        signature: string;
        cloud_name: string;
        api_key: string;
        username: string;
        timestamp: number;
        max_files: number;
    };

    signature: string;
    encodedSignature: string;

    mediaLibrary: any;

    initialized = false;

    constructor() {
        this.signature = `cloud_name=${this.cloudName}&timestamp=${this.timeStamp}&username=${this.username}${this
            .apiSecret}`;

        this.encodedSignature = shajs('sha256').update(this.signature).digest('hex');

        this.cloudinaryConfig = {
            signature: this.encodedSignature,
            cloud_name: this.cloudName,
            api_key: this.apiKey,
            username: this.username,
            timestamp: this.timeStamp,
            max_files: this.maxFiles
        };

        this.openCloudinary();
    }

    ngOnInit() {}

    startOver() {
        this.initialized = false;
        this.openCloudinary();
    }

    openCloudinary() {
        this.mediaLibrary = cloudinary.openMediaLibrary(this.cloudinaryConfig, {
            insertHandler: (data) => {
                // do nothing for now
            }
        });

        setTimeout(() => {
            this.initialized = true;
        }, 5000);
    }
}
