import { Component, OnInit } from '@angular/core';
import { SiteWiseService } from './site-wise.service';
import { finalize } from 'rxjs/operators';
import { ErrorService } from '../core/services/error.service';
import { Observable } from 'rxjs';

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
    const fileName = new Date().toISOString().slice(0, 10) + ' MTN Locations.csv';
    this.download(this.siteWiseService.downloadActiveAndFutureStores(), fileName);
  }

  downloadEmptySites() {
    const fileName = new Date().toISOString().slice(0, 10) + ' Empty Sites.csv';
    this.download(this.siteWiseService.downloadEmptySites(), fileName);
  }

  download(request: Observable<any>, fileName: string) {
    this.downloading = true;
    request.pipe(finalize(() => this.downloading = false))
      .subscribe(response => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        a.target = '_blank';
        a.click();
        a.remove();
      }, err => this.errorService.handleServerError('Failed to download extraction!', err,
        () => console.error(err),
        () => this.download(request, fileName)));
  }

}
