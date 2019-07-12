import { Component, OnDestroy, OnInit } from '@angular/core';
import { CloudinaryService } from '../../core/services/cloudinary.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mds-data-upload-cloudinary',
  templateUrl: './data-upload-cloudinary.component.html',
  styleUrls: ['./data-upload-cloudinary.component.css']
})
export class DataUploadCloudinaryComponent implements OnInit, OnDestroy {

  private assetListener: Subscription;
  private cloudinaryParams = {
    cloudName: 'mtn-retail-advisors',
    username: 'tyler@mtnra.com',
    apiSecret: 'OGQKRd95GxzMrn5d7_D6FOd7lXs',
    apiKey: '713598197624775',
    multiple: true,
    maxFiles: 100
  };

  constructor(private cloudinaryService: CloudinaryService) {
  }

  ngOnInit() {
    this.cloudinaryService.initialize(this.cloudinaryParams);
    this.assetListener = this.cloudinaryService.assetSelected$.subscribe(assets => this.handleAssets(assets));
    this.openCloudinary();
  }

  ngOnDestroy() {
    this.assetListener.unsubscribe();
  }

  handleAssets(assets) {
    console.log(assets);
    // Do nothing for now
  }

  openCloudinary() {
    this.cloudinaryService.show();
  }
}
