import { Injectable }  from '@angular/core';
import { DB } from './shared/_factories/db.factory';

function getAppConfig() {
  return new Promise((resolve, reject) => {
    function reqListener () {
      console.log(this.responseText);
      const appConfig = JSON.parse(this.responseText)
      resolve(appConfig)
    }
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", "./assets/app-config.json");
    oReq.send();
  })
}

@Injectable()
export class AppInit {
  constructor() {
  }

  Init() {
    return new Promise<void>(async (resolve, reject) => {
      debugger;
      console.log("AppInitService.init() called");
      if (window['isCordovaApp']) {
        // Check if App is installed.
        let isInstalled
        const tangerineVariablesDb = DB('tangerine-variables')
        try {
          tangerineVariablesDb.get('installed')
          isInstalled = true
        } catch(e) {
          isInstalled = false
        }
        // Check in app-config.json if we should turn off encryption.
        const appConfig = await getAppConfig();
        // If the app is not installed and app config says we should turn off encryption, then set localStorage flag of turnOffEncryption.
        // Note that checking if installed prevents app upgrading to an app-config.json that says turnOffAppLevelEncryption of doing so
        // because that would appear to result in data loss.
        if (isInstalled === false && appConfig['turnOffAppLevelEncryption']) {
          localStorage.setItem('turnOffAppLevelEncryption', 'yes')
        }
        // If localStorage flag of turnOffAppLevelEncryption is set, then set window level variable to let the db.factory.ts DB function know.
        if (localStorage.getItem('turnOffAppLevelEncryption') === 'yes') {
          window['turnOffAppLevelEncryption'] = true
        }
      }
      resolve()
    })
  }

}
