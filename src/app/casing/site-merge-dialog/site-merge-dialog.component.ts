import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/full/site';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorService } from '../../core/services/error.service';
import { forkJoin } from 'rxjs';

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
  siteAttributes = [
    {
      attrName: 'positionInCenter',
      displayName: 'Position in Center'
    },
    {
      attrName: 'address1',
      displayName: 'Address'
    },
    {
      attrName: 'city',
      displayName: 'City'
    },
    {
      attrName: 'state',
      displayName: 'State'
    },
    {
      attrName: 'postalCode',
      displayName: 'Zip Code'
    },
    {
      attrName: 'intersectionType',
      displayName: 'Intersection Type'
    },
    {
      attrName: 'quad',
      displayName: 'Quad'
    },
    {
      attrName: 'intersectionStreetPrimary',
      displayName: 'Primary Intersection'
    },
    {
      attrName: 'intersectionStreetSecondary',
      displayName: 'Secondary Intersection'
    }
  ];
  scAttributes = [
    {
      attrName: 'name',
      displayName: 'Shopping Center Name'
    },
    {
      attrName: 'owner',
      displayName: 'Shopping Center Owner'
    },
    {
      attrName: 'centerType',
      displayName: 'Shopping Center Type'
    }
  ];

  constructor(public dialogRef: MatDialogRef<SiteMergeDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private siteService: SiteService,
              private snackBar: MatSnackBar,
              private errorService: ErrorService
  ) {
  }

  ngOnInit() {
    const getSite1 = this.siteService.getOneById(this.data.selectedSiteId);
    const getSite2 = this.siteService.getOneById(this.data.duplicateSiteId);
    forkJoin(getSite1, getSite2).subscribe(sites => {
      this.site1 = sites[0];
      this.site2 = sites[1];

      // First make a copy of site 1 for your default values
      this.mergedSite = new Site(this.site1);

      // Then determine which attributes are unanimous
      this.siteAttributes.forEach(attr => attr['unanimous'] = this.site1[attr.attrName] === this.site2[attr.attrName]);
      this.scAttributes.forEach(attr => {
        attr['unanimous'] = this.site1.shoppingCenter[attr.attrName] === this.site2.shoppingCenter[attr.attrName];
      });
    });
  }

  mergeSites(): void {
    this.merging = true;
    this.siteService.mergeSites(this.mergedSite, [this.site1.id, this.site2.id])
      .pipe(finalize(() => this.merging = false))
      .subscribe(() => {
          this.snackBar.open(`Successfully merged`, null, {duration: 2000});
          this.dialogRef.close();
        },
        err => this.errorService.handleServerError('Failed to merge!', err, () => console.log(err))
      );
  }

}
