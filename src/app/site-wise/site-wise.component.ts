import { Component, OnInit } from '@angular/core';
import { SiteWiseService } from './site-wise.service';
import { finalize } from 'rxjs/operators';
import { ErrorService } from '../core/services/error.service';

@Component({
  selector: 'mds-site-wise',
  templateUrl: './site-wise.component.html',
  styleUrls: ['./site-wise.component.css'],
  providers: [SiteWiseService]
})
export class SiteWiseComponent implements OnInit {

  downloading = false;

  constructor(private siteWiseService: SiteWiseService,
              private errorService: ErrorService) {
  }

  ngOnInit() {
  }

  downloadActiveAndFutureStores() {
    this.downloading = true;
    this.siteWiseService.downloadActiveAndFutureStores()
      .pipe(finalize(() => this.downloading = false))
      .subscribe(response => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = 'extraction.csv';
        a.target = '_blank';
        a.click();
        a.remove();
      }, err => this.errorService.handleServerError('Failed to download extraction!', err,
        () => console.error(err),
        () => this.downloadActiveAndFutureStores()));
  }

}
