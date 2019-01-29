import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/full/site';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'mds-site-merge-dialog',
  templateUrl: './site-merge-dialog.component.html',
  styleUrls: ['./site-merge-dialog.component.css']
})
export class SiteMergeDialogComponent implements OnInit {

  site1: Site;
  site2: Site;
  mergedSite: Site;
  merging = false;
  siteAttributes = [{
    attrName: 'footprintSqft',
    displayName: 'Footprint SqFt'
  }, {
    attrName: 'positionInCenter',
    displayName: 'Position in Center'
  }, {
    attrName: 'address1',
    displayName: 'Address'
  }, {
    attrName: 'city',
    displayName: 'City'
  }, {
    attrName: 'state',
    displayName: 'State'
  }, {
    attrName: 'postalCode',
    displayName: 'Zip Code'
  }, {
    attrName: 'intersectionType',
    displayName: 'Intersection Type'
  }, {
    attrName: 'quad',
    displayName: 'Quad'
  }, {
    attrName: 'intersectionStreetPrimary',
    displayName: 'Primary Intersection'
  }, {
    attrName: 'intersectionStreetSecondary',
    displayName: 'Secondary Intersection'
  }];
  scAttributes = [{
    attrName: 'name',
    displayName: 'Shopping Center Name'
  }, {
    attrName: 'owner',
    displayName: 'Shopping Center Owner'
  }, {
    attrName: 'centerType',
    displayName: 'Shopping Center Type'
  }];

  constructor(public dialogRef: MatDialogRef<SiteMergeDialogComponent>,
              @Inject(MAT_DIALOG_DATA)
              public data: any,
              private siteService: SiteService,
              private snackBar: MatSnackBar,
              private errorService: ErrorService
  ) {
  }

  ngOnInit() {
    this.siteService.getOneById(this.data.selectedSiteId).subscribe((site1: Site) => {
      this.site1 = site1;
      this.siteService.getOneById(this.data.duplicateSiteId).subscribe((site2: Site) => {
        this.site2 = site2;
        this.initializedMergedSite()
      });
    });
  }

  initializedMergedSite() {
    // First make a copy of site 1 for your default values
    this.mergedSite = new Site(this.site1);

    // Then update the selected values according to the rules (distinct and not null)
    this.siteAttributes.forEach(attr => this.mergedSite[attr.attrName] = this.getSiteValue(attr.attrName));
    this.scAttributes.forEach(attr => this.mergedSite.shoppingCenter[attr.attrName] = this.getShoppingCenterValue(attr.attrName));
  }

  // Auto selects any Site attribute that isn't null in the radio buttons
  getSiteValue(attr: string) {
    if (this.site1[attr] === this.site2[attr]) {
      return this.site1[attr];
    } else {
      if (this.site1[attr] != null) {
        return this.site1[attr];
      } else {
        return this.site2[attr];
      }
    }
  }

  // Auto selects any Shopping Center attribute that isn't null in the radio buttons
  getShoppingCenterValue(attr: string) {
    if (this.site1.shoppingCenter[attr] === this.site2.shoppingCenter[attr]) {
      return this.site1.shoppingCenter[attr];
    } else {
      if (this.site1.shoppingCenter[attr]) {
        return this.site1.shoppingCenter[attr];
      } else {
        return this.site2.shoppingCenter[attr];
      }
    }
  }

  mergeSites(): void {
    this.merging = true;
    this.siteService.mergeSite(this.site1, this.site2, this.mergedSite)
      .pipe(finalize(() => this.merging = false))
      .subscribe(() => {
        const message = `Successfully merged`;
        this.snackBar.open(message, null, {duration: 2000});
        this.dialogRef.close();
      }, err => this.errorService.handleServerError('Failed to merge!', err,
        () => console.log(err)));
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
