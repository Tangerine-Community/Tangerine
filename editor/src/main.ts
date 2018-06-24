import './polyfills.ts';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from 'environments/environment';
import { AppModule } from 'app/app.module';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .then(() => {
        // registerServiceWorker('sw')
    });


function registerServiceWorker(swName: string) {
    if ('serviceWorker' in navigator) {
        (<any>navigator).serviceWorker
            .register(`${swName}.js`)
            .then(reg => {
                console.log('[App] Successful service worker registration', reg);
            })
            .catch(err =>
                console.error('[App] Service worker registration failed', err)
            );
    } else {
        console.error('[App] Service Worker API is not supported in current browser');
    }
}