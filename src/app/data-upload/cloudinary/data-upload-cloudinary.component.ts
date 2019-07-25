import { Component, OnInit } from '@angular/core';
import { CloudinaryUtil } from '../../utils/cloudinary-util';

@Component({
  selector: 'mds-data-upload-cloudinary',
  templateUrl: './data-upload-cloudinary.component.html',
  styleUrls: ['./data-upload-cloudinary.component.css']
})
export class DataUploadCloudinaryComponent implements OnInit {

  private readonly cloudinaryUtil: CloudinaryUtil;

  constructor() {
    this.cloudinaryUtil = new CloudinaryUtil();
  }

  ngOnInit() {
    this.openCloudinary();
  }

  openCloudinary() {
    this.cloudinaryUtil.show();
  }
}
