import { Component, OnInit, QueryList, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenticationService } from './shared/_services/authentication.service';
import { UserService } from './shared/_services/user.service';
import { WindowRef } from './shared/_services/window-ref.service';
import { updates } from './core/update/update/updates';
import { TangyFormService } from './tangy-forms/tangy-form-service';
import PouchDB from 'pouchdb';
import { TranslateService } from '@ngx-translate/core';
import { _TRANSLATE } from './shared/translation-marker';
import { AppConfig } from './shared/_classes/app-config.class';
import { AppConfigService } from './shared/_services/app-config.service';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  appConfig:AppConfig
  showNav;
  showUpdateAppLink;
  window;
  installed = false
  freespaceCorrectionOccuring = false;
  updateIsRunning = false;
  languageCode:string
  languageDirection:string
  languagePath:string
  translate: TranslateService
  @ViewChild(MatSidenav) sidenav: QueryList<MatSidenav>;

  constructor(
    private windowRef: WindowRef,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private appConfigService: AppConfigService,
    private http: HttpClient,
    private router: Router,
    translate: TranslateService
  ) {
    this.window = this.windowRef.nativeWindow;
    this.installed = localStorage.getItem('installed') && localStorage.getItem('languageCode') 
      ? true
      : false
    if (!this.installed) return
    this.freespaceCorrectionOccuring = false;
    // Detect if this is the first time the app has loaded.
    this.languageCode = this.window.localStorage.getItem('languageCode')
    this.languageDirection = this.window.localStorage.getItem('languageDirection')
    // Clients upgraded from < 3.2.0 will have a languageCode of LEGACY and their translation file named without a languageCode.
    this.languagePath = this.languageCode === 'LEGACY' ? 'translation' : `translation.${this.languageCode}`
    // Set up ngx-translate.
    translate.setDefaultLang(this.languagePath);
    translate.use(this.languagePath);
    // Set required config for use of <t-lang> Web Component.
    this.window.document.documentElement.lang = this.languageCode; 
    this.window.document.documentElement.dir = this.languageDirection; 
    this.window.document.body.dispatchEvent(new CustomEvent('lang-change'));
    // Make database services available to eval'd code.
    this.window.userService = this.userService
    this.window.PouchDB = this.userService.PouchDB
  }


  async ngOnInit() {
    // Load up the app config.
    this.appConfig = await this.appConfigService.getAppConfig()
    this.window.appConfig = this.appConfig
    // Bail if the app is not yet installed.
    if (!this.installed) {
      this.install()
      return
    }
    await this.userService.initialize()
    this.checkIfUpdateScriptRequired();
    // Set translation for t function used in Web Components.
    const translation = await this.http.get(`./assets/${this.languagePath}.json`).toPromise();
    this.window.translation = translation
    this.showNav = this.authenticationService.isLoggedIn();
    this.authenticationService.currentUserLoggedIn$.subscribe((isLoggedIn) => {
      this.showNav = isLoggedIn;
    });
    // Keep GPS chip warm.
    // @TODO Make this configurable. Not all installations use GPS and don't need to waste the battery.
    setInterval(this.getGeolocationPosition, 5000);
    this.checkIfUpdateScriptRequired();
    this.checkStorageUsage()
    setInterval(this.checkStorageUsage.bind(this), 60*1000); 
    // Initialize tangyFormService in case any views need to be updated.
    // @TODO Is this necessary? 
    const currentUser = await this.authenticationService.getCurrentUser();
    if (currentUser) {
      const tangyFormService = new TangyFormService({ databaseName: currentUser });
      tangyFormService.initialize();
    }
  }

  async install() {
    const config =<any> await this.http.get('./assets/app-config.json').toPromise()
    this.window.localStorage.setItem('languageCode', config.languageCode ? config.languageCode : 'en')
    this.window.localStorage.setItem('languageDirection', config.languageDirection ? config.languageDirection : 'ltr')
    this.window.localStorage.setItem('installed', true)
    this.window.location = `${this.window.location.origin}${this.window.location.pathname}index.html`
  }

  async checkStorageUsage() {
    const storageEstimate = await navigator.storage.estimate()
    const availableFreeSpace = storageEstimate.quota - storageEstimate.usage
    const minimumFreeSpace = this.appConfig.minimumFreeSpace
      ? this.appConfig.minimumFreeSpace
      : 50*1000*1000
    if (availableFreeSpace < minimumFreeSpace && this.freespaceCorrectionOccuring === false) {
      const batchSize = this.appConfig.usageCleanupBatchSize 
        ? this.appConfig.usageCleanupBatchSize 
        : 10
      this.freespaceCorrectionOccuring = true
      await this.correctFreeSpace(minimumFreeSpace, batchSize)
      this.freespaceCorrectionOccuring = false
    }
  }

  async correctFreeSpace(minimumFreeSpace, batchSize) {
    console.log('Making freespace...')
    let storageEstimate = await navigator.storage.estimate()
    let availableFreeSpace = storageEstimate.quota - storageEstimate.usage
    while(availableFreeSpace < minimumFreeSpace) {
      const DB:PouchDB = this.userService.getUserDatabase(this.window.localStorage.getItem('currentUser'))
      const results = await DB.query('tangy-form/responseByUploadDatetime', {
        descending: false,
        limit: batchSize,
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
      availableFreeSpace = storageEstimate.quota - storageEstimate.usage
    }
    console.log('Finished making freespace...')
  }

  async checkIfUpdateScriptRequired() {
    const response = await this.userService.usersDb.allDocs({ include_docs: true });
    const usernames = response
      .rows
      .map(row => row.doc)
      .map(doc => doc._id);
    for (const username of usernames) {
      const userDb:PouchDB = this.userService.getUserDatabase(username);
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
