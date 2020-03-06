import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

//declare const window: any;

if (environment.production) {
  enableProdMode();
}

//
// The following is from a suggestion on how to fix a broken prod mode.
// https://github.com/angular/angular-cli/issues/11218#issuecomment-420153739
//

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
