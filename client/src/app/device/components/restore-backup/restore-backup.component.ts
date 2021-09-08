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
        // for (let index = 0; index < this.dbNames.length; index++) {
        //   let restoreFile, payload
        //   const dbName = this.dbNames[index]
        //     restoreFile = cordova.file.externalRootDirectory + 'Download/restore/' + dbName;
        //     this.window.resolveLocalFileSystemURL(restoreFile, (fileEntry) => {
        //       // decrypt it!
        //       payload = fileEntry
        //     }, (e) => {
        //       this.success = false
        //       console.log("Error: " + e)
        //       this.errorMessage += '<p>Error with db: ' + dbName + ' fetching restoreFile: ' + restoreFile + ' Message: ' + JSON.stringify(e) + '</p>'
        //     });
        //
        //   const stream = new window['Memorystream']
        //   stream.end(payload);
        //   // copy the database
        //   console.log(`Restoring ${dbName} db`)
        //   const db = DB(dbName)
        // }
        const path = cordova.file.externalRootDirectory + 'Download/restore/'
        window['resolveLocalFileSystemURL'](path, (fileSystem) => {
            const reader = fileSystem.createReader();
            reader.readEntries(
              async (entries) => {
                console.log(entries);
                // let fileNames = []
                // entries.forEach(function(entry) {
                //   fileNames.push(entry.name)
                // });
                try {
                  await this.restoreBackups(entries)
                } catch (e) {
                  console.log(e);
                  this.errorMessage += '<p>Error restoring backup. Message: ' + e + '</p>'
                }
              },
              function (err) {
                console.log(err);
              }
            );
          }, function (err) {
            console.log(err);
          }
        );
      } else {
        this.showDirectoryDialog = true
      }
    }
  }

  async restoreBackups(files: any[]) {
    let copiedDbs = []
    const len = this.dbNames.length
    for (var i = 0; i < files.length; i++) {
      const promisify = function (funcToPromisify) {
        return new Promise(function (resolve, reject) {
            funcToPromisify(resolve, reject);
          }
        );
      };
      let entry = files[i]
      console.log("processing " + entry.name)
      const fileNameArray = entry.name.split('_')
      const dbName = fileNameArray[0]
      // const stream = fileObject.stream();
      if (this.window.isCordovaApp) {
        const fileObj = await promisify(entry.file.bind(entry))
        const reader = new FileReader();
        reader.onloadend = async (event) => {
          const result = event.target.result;
          const stream = new window['Memorystream']
          stream.end(result);
          console.log(`Loading data into ${dbName}`)
          const db = DB(dbName)
          try {
            await db.load(stream)
            // await tempDb.replicate.to(db)
            this.statusMessage += `<p>${dbName} restored</p>`
            copiedDbs.push(dbName)
            if (copiedDbs.length === len) {
              this.statusMessage += `<p>Please exit the app and restart.</p>`
            }
          } catch (e) {
            console.log("Error loading db: " + e)
            this.errorMessage += '<p>Error restoring backup database. Message: ' + JSON.stringify(e) + '</p>'
          }
        }
        reader.readAsText(<Blob>fileObj);
      } else {
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
            this.errorMessage += '<p>Error restoring backup database. Message: ' + JSON.stringify(e) + '</p>'
          }
        });
        await reader.readAsText(entry);
      }
    }
  }
}
