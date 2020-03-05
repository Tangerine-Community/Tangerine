import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'hammerjs';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

declare const window: any;

if (environment.production) {
  enableProdMode();
}

if (window['isCordovaApp']) {
  console.log('isCordovaApp')
  document.addEventListener('deviceready', () => {
    console.log('deviceready')
    platformBrowserDynamic().bootstrapModule(AppModule)
      .catch(err => console.log(err));
  }, false);
} else {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.log(err));
}
