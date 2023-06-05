import { SyncCouchdbService } from './sync/sync-couchdb.service';
import { LockBoxService } from './shared/_services/lock-box.service';
import { ClassFormService } from './class/_services/class-form.service';
import { DashboardService } from './class/_services/dashboard.service';
import { SyncService } from './sync/sync.service';
import { SyncingService } from './core/sync-records/_services/syncing.service';
import { FormTypesService } from './shared/_services/form-types.service';
import { LanguagesService } from './shared/_services/languages.service';
import { CasesService } from './case/services/cases.service';
import { CaseDefinitionsService } from './case/services/case-definitions.service';
import { TangyFormService } from './tangy-forms/tangy-form.service';
import { TangyFormsInfoService } from './tangy-forms/tangy-forms-info-service';
import { CaseService } from 'src/app/case/services/case.service';
import { VariableService } from './shared/_services/variable.service';
import { UpdateService, VAR_UPDATE_IS_RUNNING } from './shared/_services/update.service';
import { DeviceService } from './device/services/device.service';
import { Component, OnInit, QueryList, ViewChild, HostListener } from '@angular/core';
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
import { FIRST_SYNC_STATUS } from './device/components/device-sync/device-sync.component';
import { ProcessMonitorService } from './shared/_services/process-monitor.service';
import { ProcessMonitorDialogComponent } from './shared/_components/process-monitor-dialog/process-monitor-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivityService } from './shared/_services/activity.service';

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
  isAdmin = false
  kioskModeEnabled = false
  freespaceCorrectionOccuring = false;
  updateIsRunning = false;
  languageCode:string
  languageDirection:string
  languagePath:string
  ready = false
  @ViewChild(MatSidenav, {static: true}) sidenav: QueryList<MatSidenav>;
  @ViewChild('activeTasks')
  dialogRef:any

  numberOfClicks = 0 // Counting clicks to escape kiosk mode.
  exitClicks = 5 // If not defined in app-config.json, use this value
  
  constructor(
    private userService: UserService,
    private appConfigService: AppConfigService,
    private http: HttpClient,
    private router: Router,
    private updateService:UpdateService,
    private caseService:CaseService,
    private casesService:CasesService,
    private caseDefinitionsService:CaseDefinitionsService,
    private searchService:SearchService,
    private deviceService: DeviceService,
    private tangyFormsInfoService:TangyFormsInfoService,
    private tangyFormService:TangyFormService,
    private languagesService:LanguagesService,
    private formTypesService:FormTypesService,
    private syncingService:SyncingService,
    private syncService:SyncService,
    private classFormService:ClassFormService,
    private lockBoxService:LockBoxService,
    private dashboardService:DashboardService,
    private variableService:VariableService,
    private syncCouchdbService:SyncCouchdbService,
    private processMonitorService:ProcessMonitorService,
    private activityService:ActivityService,
    public dialog: MatDialog,
    private translate: TranslateService
  ) {
    this.window = window;
    this.window.PouchDB = PouchDB
    this.window.T = {
      form: {
        Get: Get
      },
      router,
      http,
      user: userService,
      lockBox: lockBoxService,
      syncing: syncingService,
      syncCouchdbService: syncCouchdbService, 
      sync: syncService,
      appConfig: appConfigService,
      update: updateService,
      search: searchService,
      device: deviceService,
      tangyFormsInfo: tangyFormsInfoService,
      tangyForms: tangyFormService,
      formTypes: formTypesService,
      case: caseService,
      cases: casesService,
      caseDefinition: caseDefinitionsService,
      languages: languagesService,
      variable: variableService,
      classForm: classFormService,
      classDashboard: dashboardService,
      activityService: activityService,
      translate: window['t']
    }
  }

  @HostListener("click")
  clicked() {
    this.exitClicks = this.appConfig.exitClicks ? this.appConfig.exitClicks : this.exitClicks
    if (this.appConfig.kioskMode && this.kioskModeEnabled) {
      this.numberOfClicks++
      console.log("click! " + this.numberOfClicks)
      if (this.numberOfClicks === 1) {
        setTimeout( () => {
          console.log('Resetting this.numberOfClicks.');
          this.numberOfClicks = 0
        }, 2000);
      }
      if (this.numberOfClicks > (this.exitClicks - 1)) {
        this.numberOfClicks = 0
        this.window.document.body.dispatchEvent(new CustomEvent('exit-fullscreen', { bubbles: true }))
      }
    }
  }
  
  async ngOnInit() {
    this.processMonitorService.change.subscribe((isDone) => {
      if (this.processMonitorService.processes.length === 0) {
        this.dialog.closeAll()
      } else {
        this.dialog.closeAll()
        this.dialogRef = this.dialog.open(ProcessMonitorDialogComponent, {
          data: {
            messages: this.processMonitorService.processes.map(process => process.description).reverse()
          },
          disableClose: true
        })
      }
    })
    let appStartProcess = this.processMonitorService.start('init', "App starting...")
    this.window.isPreviewContext = window.location.hostname === 'localhost'
      ? true
      : false
    this.installed = await this.variableService.get('installed') && await this.variableService.get('languageCode')
      ? true
      : false;
    // Detect if this is the first time the app has loaded.
    this.languageCode = await this.variableService.get('languageCode')
      ? await this.variableService.get('languageCode')
      : 'en';
    this.languageDirection = await this.variableService.get('languageDirection')
      ? await this.variableService.get('languageDirection')
      : 'ltr';

    this.freespaceCorrectionOccuring = false;

    // Clients upgraded from < 3.2.0 will have a languageCode of LEGACY and their translation file named without a languageCode.
    this.languagePath = this.languageCode === 'LEGACY' ? 'translation' : `translation.${this.languageCode}`
    // Set up ngx-translate.
    this.translate.setDefaultLang(this.languagePath);
    this.translate.use(this.languagePath);
    // Set required config for use of <t-lang> Web Component.
    this.window.document.documentElement.lang = this.languageCode;
    this.window.document.documentElement.dir = this.languageDirection;
    this.window.document.body.dispatchEvent(new CustomEvent('lang-change'));
    // Make database services available to eval'd code.
    this.window.userService = this.userService

    // Installation check.
    if (!this.installed) {
      await this.install();
    }
    await this.checkPermissions();
    // Initialize services.
    await this.deviceService.initialize()
    await this.userService.initialize();
    await this.activityService.initialize()

    // Get globally exposed config.
    this.appConfig = await this.appConfigService.getAppConfig();
    this.window.appConfig = this.appConfig;
    this.window.device = await this.deviceService.getDevice();
    this.window.translation = await this.http.get(`./assets/${this.languagePath}.json`).toPromise();

    // Use experimental mode in Tangy Form that only captures the properties of inputs that have changed from their original state in the form.
    if (this.appConfig.saveLessFormData) {
      window['useShrinker'] = true
    }

    // Redirect code for upgrading from a version prior to v3.8.0 when VAR_UPDATE_IS_RUNNING variable was not set before upgrading.
    if (!await this.appConfigService.syncProtocol2Enabled() && await this.updateService.sp1_updateRequired()) {
      this.router.navigate(['/update']);
    }

    // Set up log in status.
    this.isLoggedIn = this.userService.isLoggedIn();
    this.userService.userLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = true;
      if (window['username'] === 'admin') {
        this.isAdmin = true;
      }
    });
    this.userService.userLoggedOut$.subscribe((isLoggedIn) => {
      this.isLoggedIn = false;
      this.isAdmin = false;
    });

    // Keep GPS chip warm.
    if (!this.appConfig.disableGpsWarming) {
      setInterval(this.getGeolocationPosition, 5000);
    }
    if (this.appConfig.syncProtocol !== '2') {
      this.checkStorageUsage();
      setInterval(this.checkStorageUsage.bind(this), 60 * 1000);
    }
    this.ready = true;

    // Warn if device has not been properly synced on first try.
    if (await this.variableService.get('FIRST_SYNC_STATUS') === FIRST_SYNC_STATUS.IN_PROGRESS) {
      alert("Warning: This device has not successfully completed the first sync. Please connect to the Internet and log in as Device Admin to try again.")
    }
    // Navigate to update page if an update is running.
    if (await this.variableService.get(VAR_UPDATE_IS_RUNNING)) {
      this.router.navigate(['/update']);
    }
    this.processMonitorService.stop(appStartProcess.id)
    this.window.document.documentElement.addEventListener('enter-fullscreen', _ => {
      this.kioskModeEnabled = true
    })
    this.window.document.documentElement.addEventListener('exit-fullscreen', _ => {
      this.kioskModeEnabled = false
    })
  }

  async install() {
    try {
      const config =<any> await this.http.get('./assets/app-config.json').toPromise()
      await this.updateService.install()
      await this.variableService.set('languageCode', config.languageCode ? config.languageCode : 'en')
      await this.variableService.set('languageDirection', config.languageDirection ? config.languageDirection : 'ltr')
      await this.variableService.set('installed', 'true')
      let encryptionType:string = window['cryptoPouchRunning'] ? 'cryptoPouch' : 'unencryptedPouchDb'
      await this.variableService.set('encryptionType', encryptionType)
    } catch (e) {
      console.log('Error detected in install:')
      console.log(e)
    }
    // PWA's will have a hash; APK's won't.
    window.location.href = window.location.hash ? window.location.href.replace(window.location.hash, 'index.html') : 'file:///android_asset/www/shell/index.html'
  }

  async checkPermissions() {
    if (this.window.isCordovaApp && window['cordova']['plugins']) {
      const permissions = window['cordova']['plugins']['permissions'];
      if (typeof permissions !== 'undefined') {
        const list = [
          permissions.ACCESS_COARSE_LOCATION,
          permissions.ACCESS_FINE_LOCATION,
          permissions.CAMERA,
          permissions.RECORD_AUDIO,
          permissions.MODIFY_AUDIO_SETTINGS,
          permissions.READ_EXTERNAL_STORAGE,
          permissions.WRITE_EXTERNAL_STORAGE,
          permissions.MANAGE_EXTERNAL_STORAGE,
          permissions.WAKE_LOCK
        ];

        const error = (e) => {
          console.warn(`A permission request failed: ${JSON.stringify(e)}`);
        };
        const success = status => {
          if ( !status.hasPermission ) {
            // console.warn(`Failed permissions check; Requesting permissions`);
            permissions.requestPermissions(
              list,
              function(statusRequest) {
                if ( !statusRequest.hasPermission ) {
                  // error(`${status} does not have permission`);
                }
              },
              error);
          }
        };
        window['cordova']['plugins']['permissions'].hasPermission(list, success, error);
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
      const DB = await this.userService.getUserDatabase(this.userService.getCurrentUser())
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
          const code = error.code
          const description = error.description
          const errorMessage = "Code: " + code + " Description: " + description
          alert(_TRANSLATE('No Update') + ': ' + _TRANSLATE('Unable to check for update. Make sure you are connected to the Internet and try again.') + ' Error: ' + errorMessage);
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
          const code = error.code
          const description = error.description
          const errorMessage = "Code: " + code + " Description: " + description
          alert(_TRANSLATE('No Update') + ': ' + _TRANSLATE('Unable to check for update. Make sure you are connected to the Internet and try again.')+ ' Error: ' + errorMessage);
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
    const queue = JSON.parse(localStorage.getItem('gpsQueue')) ? (JSON.parse(localStorage.getItem('gpsQueue'))) : null;
    navigator.geolocation.getCurrentPosition((position) => {
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
      }
    },
      (err) => { },
      options);
  }
}
