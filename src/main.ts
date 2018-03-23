import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/mds.module';
import {environment} from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => {
    if (environment.production === true && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/ngsw-worker.js');
      console.log('SW registered');
    }
  })
  .catch(err => console.error(err));
