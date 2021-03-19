import { Injectable }  from '@angular/core';
import { DB } from './shared/_factories/db.factory';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

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
      debugger
      console.log("AppInitService.init() called");
      if (window['isCordovaApp']) {
        while (!window['sqliteStorageFile']) {
          await sleep(1000)
        }
        // Check if App is installed using SQLite.
        let isInstalledOnSqlite
        // This will connect to SQLite by default until we set window.turnOffAppLevelEncryption.
        const tangerineVariablesDbInSqlite = DB('tangerine-variables')
        try {
          // See if we are installed using SQLite.
          await tangerineVariablesDbInSqlite.get('installed')
          isInstalledOnSqlite = true
        } catch(e) {
          isInstalledOnSqlite = false
        }
        // Check in app-config.json if we should turn off encryption.
        const appConfig = await getAppConfig();
        // If the app is not installed and app config says we should turn off encryption, then set localStorage flag of turnOffEncryption.
        // Note that checking if installed prevents app upgrading to an app-config.json that says turnOffAppLevelEncryption of doing so
        // because that would appear to result in data loss.
        if (isInstalledOnSqlite) {
          localStorage.setItem('turnOffAppLevelEncryption', 'no')
        } else if (appConfig['turnOffAppLevelEncryption']) {
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
