import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SiteService } from '../../core/services/site.service';
import { Site } from '../../models/site';

@Component({
  selector: 'mds-location-overview',
  templateUrl: './location-overview.component.html',
  styleUrls: ['./location-overview.component.css']
})
export class LocationOverviewComponent implements OnInit {

  siteId: number;
  site: Site;

  constructor(private _location: Location,
              private route: ActivatedRoute,
              private siteService: SiteService) { }

  ngOnInit() {
    this.siteId = parseInt(this.route.snapshot.paramMap.get('siteId'), 10);
    this.siteService.getOneById(this.siteId).subscribe(site => {
      this.site = site;
      // this.site.shoppingCenter = null;
    });
  }

  goBack() {
    this._location.back();
  }
}
