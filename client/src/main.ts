import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

//declare const window: any;

if (environment.production) {
  enableProdMode();
}

if (environment['isCordova']) {
  let onDeviceReady = () => {
      window.open = window['cordova'].InAppBrowser.open;
      bootstrapFn();
  };
  document.addEventListener("deviceready", onDeviceReady, false);
} else {
  bootstrapFn();
}

function bootstrapFn() {
platformBrowserDynamic().bootstrapModule(AppModule);
}
