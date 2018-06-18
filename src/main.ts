import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => {
    if (environment.enableServiceWorker && navigator.serviceWorker != null) {
      navigator.serviceWorker.register('/ngsw-worker.js');
      console.log('SW registered');
    }
  })
  .catch(err => console.error(err));
