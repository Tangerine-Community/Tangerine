import {Component, Input, OnInit} from '@angular/core';
import {_TRANSLATE} from "../../../shared/translation-marker";
import {AppConfigService} from "../../../shared/_services/app-config.service";
import {DB} from "../../../shared/_factories/db.factory";
const SHARED_USER_DATABASE_NAME = 'shared-user-database';
const SHARED_USER_DATABASE_INDEX_NAME = 'shared-user-database-index';
const USERS_DATABASE_NAME = 'users';
const LOCKBOX_DATABASE_NAME = 'tangerine-lock-boxes';
const VARIABLES_DATABASE_NAME = 'tangerine-variables';
declare const cordova: any;
@Component({
  selector: 'app-restore-backup',
  templateUrl: './restore-backup.component.html',
  styleUrls: ['./restore-backup.component.css']
})
export class RestoreBackupComponent implements OnInit {
  window:any;
  constructor(private appConfigService: AppConfigService) {
    this.window = window;
  }
  statusMessage: string
  errorMessage: string
  success: boolean
  showDirectoryDialog: boolean
  dbNames = [SHARED_USER_DATABASE_NAME, SHARED_USER_DATABASE_INDEX_NAME, USERS_DATABASE_NAME, LOCKBOX_DATABASE_NAME, VARIABLES_DATABASE_NAME]

  ngOnInit(): void {
    console.log("RestoreBackupComponent init")
    this.statusMessage = ''
    this.errorMessage = ''
    this.success = false
  }

  async importBackups() {
    if (!confirm(_TRANSLATE('Are you sure you want to restore this backup? It will wipe any data already in Tangerine.'))) {
      return
    }
    this.statusMessage = ''
    this.errorMessage = ''
    const appConfig = await this.appConfigService.getAppConfig()
    if (window['isCordovaApp'] && appConfig.syncProtocol === '2' && !window['turnOffAppLevelEncryption']) {
      const len = this.dbNames.length
      let copiedDbs = []
      for (let index = 0; index < this.dbNames.length; index++) {
        const dbName = this.dbNames[index]
        // copy the database
        const restoreLocation = cordova.file.externalRootDirectory + 'Download/restore/' + dbName;
        this.window.resolveLocalFileSystemURL(restoreLocation, (fileEntry) => {
          const databasesLocation = cordova.file.applicationStorageDirectory + 'databases/';
          this.window.resolveLocalFileSystemURL(databasesLocation, (directory) => {
            fileEntry.copyTo(directory, dbName, () => {
              this.success = true
              console.log(`${dbName} copied!`);
              // alert(`${_TRANSLATE('File Stored At')} ${cordova.file.applicationStorageDirectory}/databases/${dbName}`);
              this.statusMessage += `<p>File stored at ${directory.fullPath}${dbName}</p>`
              copiedDbs.push(dbName)
              if (copiedDbs.length === len) {
                this.statusMessage += `<p>Please exit the app and restart.</p>`
              }
              },
              function(e) {
                this.success = false
                console.log('Unable to copy DB' + dbName);
                this.errorMessage += '<p>Error with db: ' + dbName + ' Message: ' + JSON.stringify(e) + '</p>'
              });
          }, (e) => {
            this.success = false
            console.log("Error: " + e)
            this.errorMessage += '<p>Error with db: ' + dbName + ' at databasesLocation: ' + databasesLocation + ' Message: ' + JSON.stringify(e) + '</p>'
          });
        }, (e) => {
          this.success = false
          console.log("Error: " + e)
          this.errorMessage += '<p>Error with db: ' + dbName + ' at restoreLocation: ' + restoreLocation + ' Message: ' + JSON.stringify(e) + '</p>'
        });
      }
    } else {
      if (this.window.isCordovaApp) {
        for (let index = 0; index < this.dbNames.length; index++) {
          let restoreFile, payload
          const dbName = this.dbNames[index]
          if (this.window.isCordovaApp) {
            restoreFile = cordova.file.externalRootDirectory + 'Download/restore/' + dbName;
            this.window.resolveLocalFileSystemURL(restoreFile, (fileEntry) => {
              // decrypt it!
              payload = fileEntry
            }, (e) => {
              this.success = false
              console.log("Error: " + e)
              this.errorMessage += '<p>Error with db: ' + dbName + ' fetching restoreFile: ' + restoreFile + ' Message: ' + JSON.stringify(e) + '</p>'
            });
          }

          const stream = new window['Memorystream']
          stream.end(payload);
          // copy the database
          console.log(`Restoring ${dbName} db`)
          const db = DB(dbName)
        }
      } else {
        this.showDirectoryDialog = true
      }
      
    }
  }

  async fileChangeEvent(files: File[]) {
    let copiedDbs = []
    const len = this.dbNames.length
    for (var i = 0; i < files.length; i++) {
      const file = files[i]
      console.log("processing " + file.name)
      const fileNameArray = file.name.split('_')
      const dbName = fileNameArray[0]
      //file.webkitRelativePath
      // const stream = fileObject.stream();
      const reader = new FileReader();
      reader.addEventListener('load', async (event) => {
        const result = event.target.result;
        const stream = new window['Memorystream']
        stream.end(result);
        // copy the database
        console.log(`Restoring ${dbName} db`)
        const db = DB(dbName)
        try {
          await db.load(stream)
          this.statusMessage += `<p>${dbName} restored</p>`
          copiedDbs.push(dbName)
          if (copiedDbs.length === len) {
            this.statusMessage += `<p>Please exit the app and restart.</p>`
          }
        } catch (e) {
          console.log("Error loading db: " + e)
        }
      });
      await reader.readAsText(file);
    }
  }
}
