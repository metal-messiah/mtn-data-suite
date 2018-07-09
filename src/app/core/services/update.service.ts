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
        const message = `Current: ${evt.current}, Available: ${evt.available}`;
        console.log(message);
        const snack = this.snackbar.open(message, 'Reload', {duration: 6000});

        snack.onAction().subscribe(() => {
          window.location.reload();
        });
      })
    }
  }

  checkForUpdate() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate().then(response => {
        console.log('Checked for update', response);
      });
    } else {
      this.snackbar.open('Service Worker Not Active', null, {duration: 2000});
    }
  }
}
