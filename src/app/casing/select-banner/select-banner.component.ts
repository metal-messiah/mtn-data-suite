import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ErrorService } from '../../core/services/error.service';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, map, switchMap } from 'rxjs/operators';
import { Pageable } from '../../models/pageable';
import { Banner } from '../../models/full/banner';
import { BannerService } from '../../core/services/banner.service';

@Component({
  selector: 'mds-select-banner',
  templateUrl: './select-banner.component.html',
  styleUrls: ['./select-banner.component.css']
})
export class SelectBannerComponent implements OnInit {

  banners: Banner[] = [];
  totalPages = 0;
  pageNumber = 0;
  bannerQuery: string;

  loading = false;

  @ViewChild('bannerSearchBox') bannerSearchBoxElement: ElementRef;

  constructor(public dialogRef: MatDialogRef<SelectBannerComponent>,
              private errorService: ErrorService,
              private bannerService: BannerService) {
  }

  ngOnInit() {
    this.getBanners();

    const typeAhead = fromEvent(this.bannerSearchBoxElement.nativeElement, 'input').pipe(
      map((e: KeyboardEvent) => e.target['value']),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value: any) => this.bannerService.getAllByQuery(value))
    );

    typeAhead.subscribe((pageable: Pageable<Banner>) => this.update(pageable, true));
  }

  loadMore(): void {
    this.loading = true;
    this.bannerService.getAllByQuery(this.bannerQuery, ++this.pageNumber)
      .pipe(finalize(() => this.loading = false))
      .subscribe((pageable: Pageable<Banner>) => this.update(pageable, false));
  }

  getBanners(): void {
    this.loading = true;
    this.bannerService.getAllByQuery(this.bannerQuery)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        (pageable: Pageable<Banner>) => this.update(pageable, true),
        err => console.log(err)
      );
  }

  private update(pageable: Pageable<Banner>, clear: boolean) {
    this.banners = clear ? pageable.content : this.banners.concat(pageable.content);
    this.totalPages = pageable.totalPages;
    this.pageNumber = pageable.number;
  }

  getBannerImageSrc(banner) {
    return this.bannerService.getBannerImageSrc(banner);
  }

  selectBanner(banner: Banner) {
    this.dialogRef.close(banner);
  }

}