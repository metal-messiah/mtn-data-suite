import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'mds-data-upload-cloudinary',
    templateUrl: './data-upload-cloudinary.component.html',
    styleUrls: ['./data-upload-cloudinary.component.css']
})
export class DataUploadCloudinaryComponent implements OnInit {
    showCloudinary = false;
    cloudName = 'mtn-retail-advisors';
    username = 'tyler@mtnra.com';
    apiSecret = 'OGQKRd95GxzMrn5d7_D6FOd7lXs';
    apiKey = '713598197624775';
    maxFiles = 100;

    constructor() { }

    ngOnInit() {
        this.openCloudinary();
    }

    handleAssets(assets) {
        console.log(assets);
        this.showCloudinary = false;
    }

    openCloudinary() {
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
}
