import { Component, ElementRef, OnInit, ViewChild, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ErrorService } from '../../core/services/error.service';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, map, switchMap } from 'rxjs/operators';
import { Pageable } from '../../models/pageable';
import { BannerService } from '../../core/services/banner.service';
import { CompanyService } from 'app/core/services/company.service';
import { SimplifiedBanner } from 'app/models/simplified/simplified-banner';
import { CloudinaryAsset } from 'app/shared/cloudinary/cloudinary.component';
import { Banner } from 'app/models/full/banner';
import { AuthService } from 'app/core/services/auth.service';

@Component({
  selector: 'mds-select-banner',
  templateUrl: './select-banner.component.html',
  styleUrls: ['./select-banner.component.css']
})
export class SelectBannerComponent implements OnInit, OnDestroy {

  banners: SimplifiedBanner[] = [];
  totalPages = 0;
  pageNumber = 0;
  bannerQuery: string;

  loading = false;
  remove = true;

  // LOGO - CLOUDINARY PROPS
  userCanChangeLogo: boolean;
  changeLogoBanner: SimplifiedBanner = null;
  showCloudinary = false;
  cloudName = 'mtn-retail-advisors';
  username = 'tyler@mtnra.com';
  apiSecret = 'OGQKRd95GxzMrn5d7_D6FOd7lXs';
  apiKey = '713598197624775';
  maxFiles = 1;

  checks = 0;
  checker;

  @ViewChild('bannerSearchBox') bannerSearchBoxElement: ElementRef;

  constructor(public dialogRef: MatDialogRef<SelectBannerComponent>,
    private errorService: ErrorService,
    private bannerService: BannerService,
    private companyService: CompanyService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.remove = data.remove !== undefined ? data.remove : this.remove;

    const allowedRoles = [1, 2];
    this.userCanChangeLogo = allowedRoles.includes(this.authService.sessionUser.role.id);
  }

  ngOnInit() {
    // have no event saying that the widget was hidden, poll and check
    // this.checker = setInterval(() => {
    //   this.checkStatus();
    // }, 2500);


    this.getBanners();

    const typeAhead = fromEvent(this.bannerSearchBoxElement.nativeElement, 'input').pipe(
      map((e: KeyboardEvent) => e.target['value']),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value: any) => this.bannerService.getAllByQuery(value))
    );

    typeAhead.subscribe((pageable: Pageable<SimplifiedBanner>) => this.update(pageable, true));
  }

  ngOnDestroy() {
    console.log('destroy')
    clearInterval(this.checker);
  }

  loadMore(): void {
    this.loading = true;
    this.bannerService.getAllByQuery(this.bannerQuery, ++this.pageNumber)
      .pipe(finalize(() => this.loading = false))
      .subscribe((pageable: Pageable<SimplifiedBanner>) => this.update(pageable, false));
  }

  getBanners(): void {
    this.loading = true;
    this.bannerService.getAllByQuery(this.bannerQuery)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        (pageable: Pageable<SimplifiedBanner>) => {

          this.update(pageable, true)
        },
        err => console.log(err)
      );
  }

  private update(pageable: Pageable<SimplifiedBanner>, clear: boolean) {
    this.banners = clear ? pageable.content : this.banners.concat(pageable.content);
    this.totalPages = pageable.totalPages;
    this.pageNumber = pageable.number;
  }

  getBannerImageSrc(banner: SimplifiedBanner) {
    return this.bannerService.getBannerImageSrc(banner);
  }

  getBannerCompanyName(banner: SimplifiedBanner): string {
    return banner.companyName !== banner.bannerName ? banner.companyName : ''
  }

  getBannerParentCompanyName(banner: SimplifiedBanner): string {
    return banner.companyName !== banner.parentCompanyName ? banner.parentCompanyName : ''
  }

  selectBanner(banner: SimplifiedBanner, event: MouseEvent) {
    const targetId = event.target['id'];
    if (targetId !== 'menu-icon-button-icon' && targetId !== 'menu-icon-button') {
      this.dialogRef.close(banner);
    }
  }

  changeLogo(banner: SimplifiedBanner) {
    this.changeLogoBanner = banner;
    this.showCloudinary = true;
  }

  async handleAssets(assets: CloudinaryAsset[]) {
    if (assets.length === 1 && this.changeLogoBanner) {
      const { public_id, format } = assets[0];
      const fullBanner: Banner = await this.bannerService.getOneById(this.changeLogoBanner.id).toPromise();
      fullBanner.logoFileName = `${public_id}.${format}`;

      const updatedBanner = await this.bannerService.update(new Banner(fullBanner)).toPromise();
      const existingIdx = this.banners.findIndex(b => b.id === updatedBanner.id);
      if (existingIdx >= 0) {
        this.banners[existingIdx].logoFileName = updatedBanner.logoFileName;
      }
      console.log(updatedBanner)
    }

    this.showCloudinary = false;
    this.changeLogoBanner = null;
  }

  checkStatus() {
    if (!this.cloudinaryIsShowing() && this.showCloudinary) {
      if (this.checks > 3) {
        this.showCloudinary = false;
        this.checks = 0;
      } else {
        this.checks++;
      }
    }
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

  cloudinaryIsActive(banner: SimplifiedBanner) {
    return this.showCloudinary && banner.id === this.changeLogoBanner.id;
  }
}
