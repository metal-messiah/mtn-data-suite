import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ErrorService } from '../../core/services/error.service';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, map, switchMap } from 'rxjs/operators';
import { Pageable } from '../../models/pageable';
import { BannerService } from '../../core/services/banner.service';
import { SimplifiedBanner } from '../../models/simplified/simplified-banner';

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

  @ViewChild('bannerSearchBox', { static: true }) bannerSearchBoxElement: ElementRef;

  constructor(public dialogRef: MatDialogRef<SelectBannerComponent>,
    private errorService: ErrorService,
    private bannerService: BannerService) {
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
        err => console.log(err));
  }

  getBanners(): void {
    this.loading = true;
    this.bannerService.getAllByQuery(this.bannerQuery)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        (pageable: Pageable<SimplifiedBanner>) => this.update(pageable, true),
        err => console.log(err)
      );
  }

  getBannerImageSrc(banner) {
    return this.bannerService.getBannerImageSrc(banner);
  }

  selectBanner(banner: SimplifiedBanner) {
    this.dialogRef.close(banner);
  }

}
