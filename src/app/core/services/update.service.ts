import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  constructor(private swUpdate: SwUpdate,
              private snackbar: MatSnackBar) {

    if (this.swUpdate.isEnabled) {
      console.log('Subscribing to swUpdate.available');
      this.swUpdate.available.subscribe(evt => {
        console.log(evt);
        this.snackbar.open('New version available!', 'Reload')
          .onAction().subscribe(() => {
          window.location.reload();
        });
      });
    }
  }

  checkForUpdate() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate().then(response => {
        console.log('Checked for update', response);
      });
    } else {
      console.warn('Service Worker Not Active');
    }
  }
}
