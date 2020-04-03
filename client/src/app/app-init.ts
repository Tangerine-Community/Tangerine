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
          resolve()
        })
      } else {
        resolve()
      }

    });
  }
}
