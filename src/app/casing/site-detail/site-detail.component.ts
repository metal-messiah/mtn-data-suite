import { Component, OnInit } from '@angular/core';
import { CasingService } from '../casing.service';
import { DetailFormComponent } from '../../interfaces/detail-form-component';
import { CanComponentDeactivate } from '../../core/services/can-deactivate.guard';
import { Site } from '../../models/site';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SiteService } from '../../core/services/site.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DetailFormService } from '../../core/services/detail-form.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'mds-site-detail',
  templateUrl: './site-detail.component.html',
  styleUrls: ['./site-detail.component.css']
})
export class SiteDetailComponent implements OnInit, CanComponentDeactivate, DetailFormComponent<Site> {

  siteForm: FormGroup;

  site: Site;

  isLoading = false;
  isSaving = false;

  constructor(private siteService: SiteService,
              private casingService: CasingService,
              private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private detailFormService: DetailFormService<Site>) { }

  ngOnInit() {

    // TODO if no route param - treat as new site, attempt to retrieve from casing service
    if (this.casingService.newSite != null) {
      this.site = this.casingService.newSite;
    }
  }

  createForm(): void {
    // TODO build form
  }

  setDisabledFields(): void {
    this.siteForm.get('createdBy').disable();
    this.siteForm.get('createdDate').disable();
    this.siteForm.get('updatedBy').disable();
    this.siteForm.get('updatedDate').disable();
  }

  getForm(): FormGroup {
    return this.siteForm;
  }

  getNewObj(): Site {
    if (this.casingService.newSite) {
      return this.casingService.newSite;
    }
    return new Site();
  }

  getObj(): Site {
    return this.site;
  }

  getObjService(): SiteService {
    return this.siteService;
  }

  getRoute(): ActivatedRoute {
    return this.route;
  }

  getSavableObj(): Site {
    // TODO build savable site
    return null;
  }

  getTypeName(): string {
    return 'site';
  }

  goBack() {
    this.router.navigate(['/casing']);
  }

  onObjectChange(): void {
    // TODO Update the form data with new site
  }

  setObj(obj: Site) {
    this.site = obj;
    this.onObjectChange();
  }

  saveSite() {
    this.detailFormService.save(this);
  }

  canDeactivate(): Observable<boolean> | boolean {
    return this.detailFormService.canDeactivate(this);
  }
}
