import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/full/site';

@Component({
  selector: 'mds-site-merge-dialog',
  templateUrl: './site-merge-dialog.component.html',
  styleUrls: ['./site-merge-dialog.component.css']
})
export class SiteMergeDialogComponent implements OnInit {

  siteId: number;
  duplicateSiteId: number;

  site1 = {
    shoppingCenter: {
      name: null,
      owner: 'scOwner1',
      centerType: 'scCenterType1'
    }
  };

  site2 = {
    shoppingCenter: {
      name: 'scName2',
      owner: 'scOwner2',
      centerType: 'scCenterType2'
    }
  };

  mergedSite = {
    shoppingCenter: {
      name: '',
      owner: '',
      centerType: ''
    }
  };


  // site2: Site;

  // mergedSite: any =  {
  //   scName: ''
  //   // TODO add remaining fields
  // };

  constructor(public dialogRef: MatDialogRef<SiteMergeDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private siteService: SiteService
  ) {
    this.siteId = data.selectedSiteId;
    this.duplicateSiteId = data.duplicateSiteId;
  }

  ngOnInit() {
    // this.siteService.getOneById(this.siteId).subscribe((site1: Site) => {
    //   this.site1 = site1;
    //   this.siteService.getOneById(this.duplicateSiteId).subscribe((site2: Site) => {
    //     this.site2 = site2;
    //   });
      this.mergedSite = this.site1;
      // TODO If both are null/same = hide from view, default to non-null values, 
    // });
  }

  mergeSites() {

  }

}
