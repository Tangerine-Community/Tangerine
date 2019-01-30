import { Component, OnInit, QueryList, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from './core/auth/_services/authentication.service';
import { UserService } from './core/auth/_services/user.service';
import { WindowRef } from './core/window-ref.service';
import { updates } from './core/update/update/updates';
import { TangyFormService } from './tangy-forms/tangy-form-service';
import PouchDB from 'pouchdb';
import { TranslateService } from '@ngx-translate/core';
import { _TRANSLATE } from './shared/translation-marker';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showNav;
  showUpdateAppLink;
  window;
  dir = 'ltr';
  freespaceCorrectionOccuring = false;
  updateIsRunning = false;
  @ViewChild(MatSidenav) sidenav: QueryList<MatSidenav>;
  constructor(
    private windowRef: WindowRef, private userService: UserService,
    private authenticationService: AuthenticationService,
    private http: HttpClient,
    private router: Router,
    translate: TranslateService
  ) {
    windowRef.nativeWindow.PouchDB = PouchDB;
    translate.setDefaultLang('translation');
    translate.use('translation');
    this.freespaceCorrectionOccuring = false;
  }

  async ngOnInit() {
    // Set location list as a global.
    this.window = this.windowRef.nativeWindow;
    const res = await this.http.get('./assets/location-list.json').toPromise();
    this.window.locationList = res;
    const translation = await this.http.get('./assets/translation.json').toPromise();
    this.window.translation = translation
    try {
      this.window.appConfig = await this.http.get('./assets/app-config.json').toPromise()
    } catch(e) {
      console.log('No app config found.')
    }
    if (this.window.appConfig.direction === 'rtl') {
      this.dir = 'rtl'
      let styleContainer = this.window.document.createElement('div')
      styleContainer.innerHTML = `
        <style>
          * {
              text-align: right;
              direction: rtl;
          }
        </style>
      `
      this.window.document.body.appendChild(styleContainer)
    }

    this.showNav = this.authenticationService.isLoggedIn();
    this.authenticationService.currentUserLoggedIn$.subscribe((isLoggedIn) => {
      this.showNav = isLoggedIn;
    });
    this.isAppUpdateAvailable();
    setInterval(this.getGeolocationPosition, 5000);
    this.checkIfUpdateScriptRequired();
    this.checkStorageUsage()
    setInterval(this.checkStorageUsage.bind(this), 60*1000); 
    // Initialize tangyFormService in case any views need to be updated.
    const currentUser = await this.authenticationService.getCurrentUser();
    if (currentUser) {
      const tangyFormService = new TangyFormService({ databaseName: currentUser });
      tangyFormService.initialize();
    }
  }

  async checkStorageUsage() {
    const storageEstimate = await navigator.storage.estimate()
    const freeSpace = storageEstimate.quota - storageEstimate.usage
    if (freeSpace < this.window.appConfig.minimumFreeSpace && this.freespaceCorrectionOccuring === false) {
      this.correctFreeSpace()
    }
  }

  async correctFreeSpace() {
    console.log('Making freespace...')
    this.freespaceCorrectionOccuring = true
    let storageEstimate = await navigator.storage.estimate()
    let freeSpace = storageEstimate.quota - storageEstimate.usage
    while(freeSpace < this.window.appConfig.minimumFreeSpace) {
      const DB = new PouchDB(this.window.localStorage.getItem('currentUser'))
      const results = await DB.query('tangy-form/responseByUploadDatetime', {
        descending: false,
        limit: this.window.appConfig.usageCleanupBatchSize,
        include_docs: true 
      });
      for(let row of results.rows) {
        await DB.remove(row.doc)
      }
      await DB.compact()
      // Sleep so we give time for IndexedDB to adjust itself and also not to overload the main task a user might
      // be trying to complete.
      await sleep(60*1000)
      // Get a new estimate.
      storageEstimate = await navigator.storage.estimate()
      freeSpace = storageEstimate.quota - storageEstimate.usage
    }
    console.log('Finished making freespace...')
    this.freespaceCorrectionOccuring = false
  }

  async checkIfUpdateScriptRequired() {
    const usersDb = new PouchDB('users');
    const response = await usersDb.allDocs({ include_docs: true });
    const usernames = response
      .rows
      .map(row => row.doc)
      .filter(doc => doc.hasOwnProperty('username'))
      .map(doc => doc.username);
    for (const username of usernames) {
      const userDb = await new PouchDB(username);
      // Use try in case this is an old account where info doc was not created.
      let infoDoc = { _id: '', atUpdateIndex: 0 };
      try {
        infoDoc = await userDb.get('info');
      } catch (e) {
        await userDb.put({ _id: 'info', atUpdateIndex: 0 });
        infoDoc = await userDb.get('info');
      }
      const atUpdateIndex = infoDoc.hasOwnProperty('atUpdateIndex') ? infoDoc.atUpdateIndex : 0;
      const lastUpdateIndex = updates.length - 1;
      if (lastUpdateIndex !== atUpdateIndex) {
        this.router.navigate(['/update']);
      }
    }
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['login']);
  }

  async isAppUpdateAvailable() {
    try {
      const response = await this.http.get('../../release-uuid.txt').toPromise();
      const foundReleaseUuid = `${response}`.replace(/\n|\r/g, '');
      const storedReleaseUuid = localStorage.getItem('release-uuid');
      this.showUpdateAppLink = foundReleaseUuid === storedReleaseUuid ? false : true;
    } catch (e) {
    }
  }

  updateApp() {
    if (this.window.isCordovaApp) {
      console.log('Running from APK');
      const installationCallback = (error) => {
        if (error) {
          console.log('Failed to install the update with error code:' + error.code);
          console.log(error.description);
          this.updateIsRunning = false;
        } else {
          console.log('Update Instaled');
          this.updateIsRunning = false;
        }
      };
      const updateCallback = (error, data) => {
        console.log('data: ' + JSON.stringify(data));
        if (error) {
          console.log('error: ' + JSON.stringify(error));
          alert('No Update: ' + JSON.stringify(error.description));
        } else {
          console.log('Update is Loaded');
          if (this.window.confirm(_TRANSLATE('An update is available. Be sure to first sync your data before installing the update. If you have not done this, click `CANCEL`. If you are ready to install the update, click `OK`'))) {
            this.updateIsRunning = true;
            console.log('Installing Update');
            this.window.chcp.installUpdate(installationCallback);
          } else {
            console.log('Cancelled install; did not install update.');
            this.updateIsRunning = false;
          }
        }
      };
      alert(_TRANSLATE('The app will now check for an application update and attempt to download. Please stay connected to the Internet during this process. Tap OK to proceed.'))
      this.window.chcp.fetchUpdate(updateCallback);
    } else {
      const currentPath = this.window.location.pathname;
      const storedReleaseUuid = localStorage.getItem('release-uuid');
      this.window.location.href = (currentPath.replace(`${storedReleaseUuid}\/app\/`, ''));
    }

  }

  getGeolocationPosition() {
    const options = {
      enableHighAccuracy: true
    };
    const queue = JSON.parse(localStorage.getItem('gpsQueue')) ? (JSON.parse(localStorage.getItem('gpsQueue'))) : null;
    navigator.geolocation.getCurrentPosition((position: Position) => {
      // Accuracy is in meters, a lower reading is better
      if (!queue || (typeof queue !== 'undefined' && ((position.timestamp - queue.timestamp) / 1000) >= 30) ||
        queue.accuracy >= position.coords.accuracy) {
        const x = {
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
          timestamp: position.timestamp
        };
        localStorage.setItem('gpsQueue', JSON.stringify(x));
      } else { console.log(position); }
    },
      (err) => { },
      options);
  }
}
