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
  restoreDir: string = 'Documents/Tangerine/restore/'
  
  ngOnInit(): void {
    // console.log("RestoreBackupComponent init")
    this.statusMessage = ''
    this.errorMessage = ''
    this.success = false
    if (this.window.isCordovaApp) {
      this.window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + 'Documents', (directoryEntry) => {
        directoryEntry.getDirectory('Tangerine', { create: true }, (dirEntry) => {
          dirEntry.getDirectory('backups', { create: true }, (subDirEntry) => {
          }, this.onErrorGetDir);
          dirEntry.getDirectory('restore', { create: true }, (subDirEntry) => {
          }, this.onErrorGetDir);
        }, this.onErrorGetDir);
      })
    }
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
        const restoreLocation = cordova.file.externalRootDirectory + 'Documents/Tangerine/restore/' + dbName;
        const databasesLocation = cordova.file.applicationStorageDirectory + 'databases/';
        this.window.resolveLocalFileSystemURL(restoreLocation, (fileEntry) => {
          this.window.resolveLocalFileSystemURL(databasesLocation, (directory) => {
            fileEntry.copyTo(directory, dbName, () => {
              this.success = true
              console.log(`${dbName} copied!`);
              // alert(`${_TRANSLATE('File Stored At')} ${cordova.file.applicationStorageDirectory}/databases/${dbName}`);
              this.statusMessage += `<p>${_TRANSLATE('File restored from ')} ${directory.fullPath}${dbName}}</p>`
              copiedDbs.push(dbName)
              if (copiedDbs.length === len) {
                this.statusMessage += `<p>${_TRANSLATE('Please exit the app and restart.')}</p>`
              }
              },
              function(e) {
                this.success = false
                console.log('Unable to copy DB' + dbName);
                this.errorMessage += `<p>${_TRANSLATE('Error restoring db ')} : ${dbName} to restoreLocation:  ${restoreLocation} Message: ${JSON.stringify(e)}</p>`
              });
          }, (e) => {
            this.success = false
            console.log("Error: " + e)
            this.errorMessage += `<p>${_TRANSLATE('Error restoring db ')} : ${dbName} to restoreLocation:  ${restoreLocation} Message: ${JSON.stringify(e)}</p>`
          });
        }, (e) => {
          this.success = false
          console.log("Error: " + e)
          this.errorMessage += `<p>${_TRANSLATE('Error restoring db ')} : ${dbName} to restoreLocation:  ${restoreLocation} Message: ${JSON.stringify(e)}</p>`
        });
      }
    } else {
      if (this.window.isCordovaApp) {
        const path = cordova.file.externalRootDirectory + 'Documents/Tangerine/restore/'
        window['resolveLocalFileSystemURL'](path, (fileSystem) => {
            const reader = fileSystem.createReader();
            reader.readEntries(
              async (entries) => {
                console.log(entries);
                try {
                  await this.restoreBackups(entries)
                } catch (e) {
                  console.log(e);
                  this.errorMessage += `<p>${_TRANSLATE('Error restoring backup')} Message: ${JSON.stringify(e)}</p>`
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
      const promisify = (f) =>
        (...a) => new Promise ((res, rej) => f (...a, res, rej))
      let entry = files[i]
      console.log("processing " + entry.name)
      this.statusMessage += "<p>" + _TRANSLATE("Processing ") + entry.name + "</p>"
      const fileNameArray = entry.name.split('_')
      const dbName = fileNameArray[0]
      // const stream = fileObject.stream();
      if (this.window.isCordovaApp) {
        await promisify(entry.file(async (file) => {
          const reader = new FileReader();
          reader.onloadend = async (event) => {
            const result = event.target.result;
            const stream = new window['Memorystream']
            stream.end(result);
            // copy the database
            console.log(`Restoring ${dbName} db`)
            const db = DB(dbName)
            try {
              await db.load(stream)
              this.statusMessage += `<p>${dbName} ${_TRANSLATE("restored")}</p>`
              copiedDbs.push(dbName)
              if (copiedDbs.length === len) {
                this.statusMessage += `<p>&nbsp;</p>\n<p class="doneMessage">${_TRANSLATE("Restore complete: Please exit the app and restart.")}</p>`
              }
            } catch (e) {
              console.log("Error loading db: " + e)
              this.errorMessage += '<p>' + _TRANSLATE("Error restoring backup database. Message: ") + JSON.stringify(e) + '</p>'
            }
          }
          await reader.readAsText(file);
        }))
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
            this.statusMessage += `<p>${dbName} ${_TRANSLATE("restored")}</p>`
            copiedDbs.push(dbName)
            if (copiedDbs.length === len) {
              this.statusMessage += `<p>${_TRANSLATE("Please exit the app and restart.")}</p>`
            }
          } catch (e) {
            console.log("Error loading db: " + e)
            this.errorMessage += '<p>' + _TRANSLATE("Error restoring backup database. Message: ") + JSON.stringify(e) + '</p>'
          }
        });
        await reader.readAsText(entry);
      }
    }
  }

  onErrorGetDir(e) {
    console.log("Error: " + e)
    let errorMessage
    if (e && e.code && e.code === 1) {
      errorMessage = "File or directory not found."
    } else {
      errorMessage = e
    }
    this.errorMessage += `<p>${_TRANSLATE('Error creating directory. Error: ')} ${errorMessage}</p>`
  }
  
}
