import { Injectable }  from '@angular/core';

@Injectable()
export class AppInit {
  constructor() {
  }

  Init() {

    return new Promise<void>((resolve, reject) => {
      console.log("AppInitService.init() called");
      ////do your initialisation stuff here
      if (window['isCordovaApp']) {
        debugger;
        document.addEventListener('deviceready', async () => {
          function reqListener () {
            console.log(this.responseText);
            const appConfig = JSON.parse(this.responseText)
            if (appConfig.turnOffAppLevelEncryption) {
              window['turnOffAppLevelEncryption'] = true
            }
            resolve()
          }
          var oReq = new XMLHttpRequest();
          oReq.addEventListener("load", reqListener);
          oReq.open("GET", "./assets/app-config.json");
          oReq.send();
        })
      } else {
        resolve()
      }

    });
  }
}
