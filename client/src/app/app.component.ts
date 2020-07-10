import { VariableService } from './shared/_services/variable.service';
import { UpdateService, VAR_UPDATE_IS_RUNNING } from './shared/_services/update.service';
import { DeviceService } from './device/services/device.service';
import { Component, OnInit, QueryList, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { UserService } from './shared/_services/user.service';
import PouchDB from 'pouchdb';
import { TranslateService } from '@ngx-translate/core';
import { _TRANSLATE } from './shared/translation-marker';
import { AppConfig } from './shared/_classes/app-config.class';
import { AppConfigService } from './shared/_services/app-config.service';
import { SearchService } from './shared/_services/search.service';
import { Get } from 'tangy-form/helpers.js'

const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  appConfig:AppConfig
  showUpdateAppLink;
  window:any;
  installed = false
  isLoggedIn = false
  freespaceCorrectionOccuring = false;
  updateIsRunning = false;
  languageCode:string
  languageDirection:string
  languagePath:string
  ready = false
  @ViewChild(MatSidenav, {static: true}) sidenav: QueryList<MatSidenav>;

  constructor(
    private userService: UserService,
    private appConfigService: AppConfigService,
    private http: HttpClient,
    private router: Router,
    private updateService: UpdateService,
    private searchService: SearchService,
    private deviceService: DeviceService,
    private variableService: VariableService,
    private translate: TranslateService
  ) {
    this.window = window;
    this.window.PouchDB = PouchDB
    this.freespaceCorrectionOccuring = false;


    // Make database services available to eval'd code.
    this.window.userService = this.userService
  }

  async ngOnInit() {

    await this.initFields();
    // Installation check.
    if (!this.installed) {
      await this.install();
    }
    await this.checkPermissions();
    // Initialize services.
    await this.userService.initialize();
    await this.searchService.start();

    // Get globally exposed config.
    this.appConfig = await this.appConfigService.getAppConfig();
    this.window.appConfig = this.appConfig;
    this.window.device = await this.deviceService.getDevice();
    this.window.translation = await this.http.get(`./assets/${this.languagePath}.json`).toPromise();

    //  Expose helpers inside T:
    window['T'] = {
      "form": {
        Get: Get
      },
      "user": this.userService
    }

    // Redirect code for upgrading from a version prior to v3.8.0 when VAR_UPDATE_IS_RUNNING variable was not set before upgrading.
    if (!await this.appConfigService.syncProtocol2Enabled() && await this.updateService.sp1_updateRequired()) {
      await this.router.navigate(['/update']);
    }

    // Set up log in status.
    this.isLoggedIn = await this.userService.isLoggedIn();
    this.userService.userLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = true;
    });
    this.userService.userLoggedOut$.subscribe((isLoggedIn) => {
      this.isLoggedIn = false;
    });

    // Keep GPS chip warm.
    setInterval(this.getGeolocationPosition, 5000);
    await this.checkStorageUsage();
    setInterval(this.checkStorageUsage.bind(this), 60 * 1000);
    this.ready = true;

    // Lastly, navigate to update page if an update is running.
    if (await this.variableService.get(VAR_UPDATE_IS_RUNNING)) {
      await this.router.navigate(['/update']);
    }
  }

  async install() {
    try {
      const config =<any> await this.http.get('./assets/app-config.json').toPromise()
      await this.updateService.install()
      await this.variableService.set('languageCode', config.languageCode ? config.languageCode : 'en')
      await this.variableService.set('languageDirection', config.languageDirection ? config.languageDirection : 'ltr')
      await this.variableService.set('installed', 'true')
      // TODO - abstract into an immportable function to set a delay (sleep)
      await this.variableService.set('koko', 'poco')
      await this.variableService.set('kinko', 'pinko')
      // await this.variableService.close()
    } catch (e) {
      console.log('Error detected in install:')
      console.log(e)
    }
    // PWA's will have a hash; APK's won't.
    window.location.href = window.location.hash ? window.location.href.replace(window.location.hash, 'index.html') : 'file:///android_asset/www/shell/index.html'
  }

  async initFields() {
    // Detect if this is the first time the app has loaded.
    let languageCode = await this.variableService.get('languageCode')
    let languageDirection = await this.variableService.get('languageDirection')
    let koko = await this.variableService.get('koko')
    let installed = await this.variableService.get('installed')
    this.installed = installed && languageCode
      ? true
      : false
    // Preload some properties if installing app.
    this.languageCode = languageCode
      ? languageCode
      : 'en'
    this.languageDirection = languageDirection
      ? languageDirection
      : 'ltr'
    // Clients upgraded from < 3.2.0 will have a languageCode of LEGACY and their translation file named without a languageCode.
    this.languagePath = this.languageCode === 'LEGACY' ? 'translation' : `translation.${this.languageCode}`
    // Set up ngx-translate.
    this.translate.setDefaultLang(this.languagePath);
    this.translate.use(this.languagePath);
    // Set required config for use of <t-lang> Web Component.
    this.window.document.documentElement.lang = this.languageCode;
    this.window.document.documentElement.dir = this.languageDirection;
    this.window.document.body.dispatchEvent(new CustomEvent('lang-change'));
  }

  async checkPermissions() {
    if (this.window.isCordovaApp) {
      const permissions = window['cordova']['plugins']['permissions'];
      if (typeof permissions !== 'undefined') {
        const list = [
          permissions.ACCESS_COARSE_LOCATION,
          permissions.ACCESS_FINE_LOCATION,
          permissions.CAMERA,
          permissions.READ_EXTERNAL_STORAGE,
          permissions.WRITE_EXTERNAL_STORAGE
        ];

        window['cordova']['plugins']['permissions'].hasPermission(list, success, error);
        function error() {
          console.warn('Camera or Storage permission is not turned on');
        }
        function success( status ) {
          if ( !status.hasPermission ) {
            permissions.requestPermissions(
              list,
              function(statusRequest) {
                if ( !statusRequest.hasPermission ) {
                  error();
                }
              },
              error);
          }
        }
      }
    }
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
      let currentUser = this.userService.getCurrentUser()
      const DB = await this.userService.getUserDatabase(currentUser)
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

  logout() {
    this.userService.logout();
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

  async updateApp() {
    if (!confirm(_TRANSLATE('Would you like to update? We recommend syncing data before you do.'))) {
      return
    }
    await this.variableService.set(VAR_UPDATE_IS_RUNNING, true)
    if (this.window.isCordovaApp) {
      this.updateIsRunning = true;
      console.log('Running from APK');
      const installationCallback = async (error) => {
        if (error) {
          console.log('Failed to install the update with error code:' + error.code);
          console.log(error.description);
          await this.variableService.set(VAR_UPDATE_IS_RUNNING, false)
          this.updateIsRunning = false;
          alert(_TRANSLATE('No Update') + ': ' + _TRANSLATE('Unable to check for update. Make sure you are connected to the Internet and try again.'));
        } else {
          console.log('APK update downloaded. Reloading for new code...');
          // No need to set in memory semaphore to false, app will reload.
          // this.updateIsRunning = false;
          // CHCP seems to handle the reload.
        }
      };
      const updateCallback = async (error, data) => {
        console.log('data: ' + JSON.stringify(data));
        if (error) {
          console.log('error: ' + JSON.stringify(error));
          await this.variableService.set(VAR_UPDATE_IS_RUNNING, false)
          this.updateIsRunning = false;
          alert(_TRANSLATE('No Update') + ': ' + _TRANSLATE('Unable to check for update. Make sure you are connected to the Internet and try again.'));
        } else {
          console.log('Update has downloaded');
          console.log('Installing update');
          this.window.chcp.installUpdate(installationCallback);
        }
      };
      this.window.chcp.fetchUpdate(updateCallback);
    } else {
      // Forward to PWA Updater App.
      const currentPath = this.window.location.pathname;
      const storedReleaseUuid = localStorage.getItem('release-uuid');
      this.window.location.href = (currentPath.replace(`${storedReleaseUuid}\/app\/`, ''));
    }
  }

  getGeolocationPosition() {
    const options = {
      enableHighAccuracy: true
    };
    // We prefer not to use localstorage so that our app databases may be portable and easily restored; however,
    // for some data this is fine, especially if the underlying lib uses localStorage for the same field.
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
