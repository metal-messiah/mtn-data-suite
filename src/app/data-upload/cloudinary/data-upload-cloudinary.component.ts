import { Component, OnInit } from '@angular/core';
import { CloudinaryService } from '../../core/services/cloudinary.service';

@Component({
  selector: 'mds-data-upload-cloudinary',
  templateUrl: './data-upload-cloudinary.component.html',
  styleUrls: ['./data-upload-cloudinary.component.css']
})
export class DataUploadCloudinaryComponent implements OnInit {

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
    this.cloudinaryService.initialize(this.cloudinaryParams, (assets) => this.handleAssets(assets));
    this.openCloudinary();
  }

  handleAssets(assets) {
    console.log(assets);
    // Do nothing for now
  }

  openCloudinary() {
    this.cloudinaryService.show();
  }
}
