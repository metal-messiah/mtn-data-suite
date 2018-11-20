import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/full/site';
import { ShoppingCenter} from '../../models/full/shopping-center';

@Component({
  selector: 'mds-site-merge-dialog',
  templateUrl: './site-merge-dialog.component.html',
  styleUrls: ['./site-merge-dialog.component.css']
})
export class SiteMergeDialogComponent implements OnInit {

  siteId: number;
  duplicateSiteId: number;

  constructor(public dialogRef: MatDialogRef<SiteMergeDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private siteService: SiteService,
              // private shoppingCenterName: ShoppingCenter
  ) {
    this.siteId = data.selectedSiteId;
    this.duplicateSiteId = data.duplicateSiteId;
  }

  ngOnInit() {
    this.siteService.getOneById(this.siteId).subscribe((siteId: Site) => this.siteId)
    // TODO Get both sites

  }

  mergeSites() {

  }

}
