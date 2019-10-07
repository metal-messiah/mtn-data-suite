import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { ErrorService } from '../../core/services/error.service';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, map, mergeMap, switchMap } from 'rxjs/operators';
import { Pageable } from '../../models/pageable';
import { BannerService } from '../../core/services/banner.service';
import { SimplifiedBanner } from 'app/models/simplified/simplified-banner';
import { Banner } from 'app/models/full/banner';
import { AuthService } from 'app/core/services/auth.service';
import { CloudinaryUtil } from '../../utils/cloudinary-util';
import { CloudinaryAsset } from '../../shared/cloudinary/CloudinaryAsset';

@Component({
  selector: 'mds-select-banner',
  templateUrl: './select-banner.component.html',
  styleUrls: ['./select-banner.component.css']
})
export class SelectBannerComponent implements OnInit {

  banners: SimplifiedBanner[] = [];
  totalPages = 0;
  pageNumber = 0;
  bannerQuery: string;

  loading = false;

  // LOGO - CLOUDINARY PROPS
  userCanChangeLogo: boolean;
  changeLogoBanner: SimplifiedBanner = null;

  @ViewChild('bannerSearchBox', {static: true}) bannerSearchBoxElement: ElementRef;

  private readonly cloudinaryUtil: CloudinaryUtil;

  constructor(private dialogRef: MatDialogRef<SelectBannerComponent>,
              private errorService: ErrorService,
              private bannerService: BannerService,
              private authService: AuthService,
              private snackBar: MatSnackBar) {
    const allowedRoles = [1, 2];
    this.userCanChangeLogo = allowedRoles.includes(this.authService.sessionUser.role.id);
    this.cloudinaryUtil = new CloudinaryUtil(this.handleAssets);
  }

  ngOnInit() {
    this.getBanners();

    fromEvent(this.bannerSearchBoxElement.nativeElement, 'input').pipe(
      map((e: KeyboardEvent) => e.target['value']),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value: any) => this.bannerService.getAllByQuery(value))
    ).subscribe((pageable: Pageable<SimplifiedBanner>) => this.update(pageable, true));

  }

  private update(pageable: Pageable<SimplifiedBanner>, clear: boolean) {
    this.banners = clear ? pageable.content : this.banners.concat(pageable.content);
    this.totalPages = pageable.totalPages;
    this.pageNumber = pageable.number;
  }

  loadMore(): void {
    this.loading = true;
    this.bannerService.getAllByQuery(this.bannerQuery, ++this.pageNumber)
      .pipe(finalize(() => this.loading = false))
      .subscribe((pageable: Pageable<SimplifiedBanner>) => this.update(pageable, false),
        err => this.errorService.handleServerError('Failed to get more banners!', err,
          () => console.error(err), () => this.loadMore()));
  }

  getBanners(): void {
    this.loading = true;
    this.bannerService.getAllByQuery(this.bannerQuery)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        (pageable: Pageable<SimplifiedBanner>) => this.update(pageable, true),
        err => this.errorService.handleServerError('Failed to get banners!', err,
          () => console.error(err), () => this.loadMore())
      );
  }

  getBannerImageSrc(banner: SimplifiedBanner) {
    return this.cloudinaryUtil.getUrlForLogoFileName(banner.logoFileName);
  }

  getBannerCompanyName(banner: SimplifiedBanner): string {
    return banner.companyName !== banner.bannerName ? banner.companyName : '';
  }

  getBannerParentCompanyName(banner: SimplifiedBanner): string {
    return banner.companyName !== banner.parentCompanyName ? banner.parentCompanyName : '';
  }

  selectBanner(banner: SimplifiedBanner, event: MouseEvent) {
    const targetId = event.target['id'];
    if (targetId !== 'menu-icon-button-icon' && targetId !== 'menu-icon-button') {
      this.dialogRef.close(banner);
    }
  }

  changeLogo(banner: SimplifiedBanner) {
    this.changeLogoBanner = banner;
    this.cloudinaryUtil.show();
  }

  handleAssets(assets: CloudinaryAsset[]) {
    if (assets.length > 1) {
      this.snackBar.open('Please choose just one banner!', null, {duration: 2000});
    } else if (assets.length === 1 && this.changeLogoBanner) {
      const {public_id, format} = assets[0];
      this.bannerService.getOneById(this.changeLogoBanner.id)
        .pipe(finalize(() => {
          this.changeLogoBanner = null;
        }))
        .pipe(mergeMap((fullBanner: Banner) => {
          fullBanner.logoFileName = `${public_id}.${format}`;
          return this.bannerService.update(fullBanner);
        }))
        .subscribe(updatedBanner => {
          const existingIdx = this.banners.findIndex(b => b.id === updatedBanner.id);
          if (existingIdx >= 0) {
            this.banners[existingIdx].logoFileName = updatedBanner.logoFileName;
          }
        }, err => this.errorService.handleServerError('Failed to update banner logo!', err,
          () => console.error(err), () => this.handleAssets(assets)));
    } else {
      this.changeLogoBanner = null;
    }
  }

}
