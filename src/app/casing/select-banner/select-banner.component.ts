import { Component, ElementRef, OnInit, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ErrorService } from '../../core/services/error.service';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, map, switchMap } from 'rxjs/operators';
import { Pageable } from '../../models/pageable';
import { BannerService } from '../../core/services/banner.service';
import { CompanyService } from 'app/core/services/company.service';
import { SimplifiedBanner } from 'app/models/simplified/simplified-banner';

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
  remove = true;

  @ViewChild('bannerSearchBox') bannerSearchBoxElement: ElementRef;

  constructor(public dialogRef: MatDialogRef<SelectBannerComponent>,
    private errorService: ErrorService,
    private bannerService: BannerService,
    private companyService: CompanyService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.remove = data.remove !== undefined ? data.remove : this.remove;
  }

  ngOnInit() {
    this.getBanners();

    const typeAhead = fromEvent(this.bannerSearchBoxElement.nativeElement, 'input').pipe(
      map((e: KeyboardEvent) => e.target['value']),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value: any) => this.bannerService.getAllByQuery(value))
    );

    typeAhead.subscribe((pageable: Pageable<SimplifiedBanner>) => this.update(pageable, true));
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

  getBannerParentCompanyName(banner: SimplifiedBanner): string {
    return banner.companyName !== banner.parentCompanyName ? banner.parentCompanyName : ''
  }

  selectBanner(banner: SimplifiedBanner) {
    this.dialogRef.close(banner);
  }

}
