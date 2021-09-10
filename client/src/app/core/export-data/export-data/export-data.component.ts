import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/_services/user.service';
import { SyncingService } from '../../sync-records/_services/syncing.service';
import { _TRANSLATE } from '../../../shared/translation-marker';
import {AppConfigService} from '../../../shared/_services/app-config.service';
import { DB } from '../../../shared/_factories/db.factory'
const SHARED_USER_DATABASE_NAME = 'shared-user-database';
const SHARED_USER_DATABASE_INDEX_NAME = 'shared-user-database-index';
const USERS_DATABASE_NAME = 'users';
const LOCKBOX_DATABASE_NAME = 'tangerine-lock-boxes';
const VARIABLES_DATABASE_NAME = 'tangerine-variables';

declare const cordova: any;
@Component({
  selector: 'app-export-data',
  templateUrl: './export-data.component.html',
  styleUrls: ['./export-data.component.css']
})
export class ExportDataComponent implements OnInit {

  window:any;
  statusMessage: string
  errorMessage: string
  backupDir: string = 'Documents/Tangerine/backups/'
  
  constructor(
    private userService: UserService,
    private syncingService: SyncingService,
    private appConfigService: AppConfigService
  ) {
    this.window = window;
  }

  ngOnInit() {
    this.statusMessage = ''
    this.errorMessage = ''
    
    if (this.window.isCordovaApp) {
      this.backupDir = 'Documents/Tangerine/backups/'
    } else {
      this.backupDir = `${_TRANSLATE('Click button to start download to desired directory.')} `
    }
    
    if (this.window.isCordovaApp) {
      this.window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + 'Documents', (directoryEntry) => {
        directoryEntry.getDirectory('Tangerine', { create: true }, (dirEntry) => {
          dirEntry.getDirectory('backups', { create: true }, (subDirEntry) => {
          }, onErrorGetDir);
          dirEntry.getDirectory('restore', { create: true }, (subDirEntry) => {
          }, onErrorGetDir);
        }, onErrorGetDir);
      })
    }
  }
  
  async exportAllRecords() {
    this.statusMessage = ''
    this.errorMessage = ''
    const appConfig = await this.appConfigService.getAppConfig()
    const dbNames = [SHARED_USER_DATABASE_NAME, SHARED_USER_DATABASE_INDEX_NAME, USERS_DATABASE_NAME, LOCKBOX_DATABASE_NAME, VARIABLES_DATABASE_NAME]
    // APK's that use in-app encryption
    if (window['isCordovaApp'] && appConfig.syncProtocol === '2' && !window['turnOffAppLevelEncryption']) {
      const backupLocation = cordova.file.externalRootDirectory + this.backupDir;
      for (const dbName of dbNames) {
        // copy the database
        console.log(`copying ${dbName} db over to the user accessible fs`)
        // tslint:disable-next-line:max-line-length
        this.window.resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory + 'databases/' + dbName, (fileEntry) => {
          this.window.resolveLocalFileSystemURL(backupLocation, (directory) => {
            fileEntry.copyTo(directory, dbName, () => {
                console.log('DB Copied!');
                // alert(`${_TRANSLATE('File Stored At')} ${cordova.file.externalDataDirectory}${dbName}`);
                this.statusMessage += `<p>${_TRANSLATE('DB Copied to ')} ${cordova.file.externalDataDirectory}${dbName}</p>`
              }, (e) => {
                console.log('Unable to copy DB');
                alert(`${_TRANSLATE('Write Failed: ')}` + e.toString());
              });
          }, null);
        }, null);
      }
    } else {
      // APK's or PWA's that do not use in-app encryption - have turnOffAppLevelEncryption:true in app-config.json
      for (let index = 0; index < dbNames.length; index++) {
        const stream = new window['Memorystream']
        let data = '';
        stream.on('data', function(chunk) {
          data += chunk.toString();
        });
        const dbName = dbNames[index]
        // copy the database
        console.log(`exporting ${dbName} db over to the user accessible fs`)
        const db = DB(dbName)
        try {
          await db.dump(stream)
          console.log('Successfully exported : ' + dbName);
          this.statusMessage += `<p>${_TRANSLATE('Successfully exported database ')} ${dbName}</p>`
          const file = new Blob([data], {type: 'application/json'});
          // const currentUser = this.userService.getCurrentUser();
          const now = new Date();
          const fileName =
            `${dbName}_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.json`;
          if (this.window.isCordovaApp) {
            const backupLocation = cordova.file.externalRootDirectory + this.backupDir;
            document.addEventListener('deviceready', () => {
              this.window.resolveLocalFileSystemURL(backupLocation, (directoryEntry) => {
                directoryEntry.getFile(fileName, {create: true}, (fileEntry) => {
                  fileEntry.createWriter((fileWriter) => {
                    fileWriter.onwriteend = (data) => {
                      this.statusMessage += `<p>${_TRANSLATE('File Stored At')} ${backupLocation}${dbName}</p>`
                    };
                    fileWriter.onerror = (e) => {
                      alert(`${_TRANSLATE('Write Failed')}` + e.toString());
                      this.errorMessage += `<p>${_TRANSLATE('Write Failed')}` + e.toString() + "</p>"
                    };
                    fileWriter.write(data);
                  });
                });
              }, (e) => {
                console.log("Error: " + e)
                let errorMessage
                if (e && e.code && e.code === 1) {
                  errorMessage = "File or directory not found."
                } else {
                  errorMessage = e
                }
                this.errorMessage += `<p>${_TRANSLATE('Error exporting file: ')} ${fileName} ${_TRANSLATE(' at backup location: ')} ${backupLocation}  ${_TRANSLATE(' Error: ')} ${errorMessage}</p>`
              });
            }, false);
          } else {
            downloadData(file, fileName, 'application/json');
          }
        } catch (e) {
          console.log("Error: " + e)
          this.errorMessage += `<p>${_TRANSLATE('Error: ')} ${JSON.stringify(e)}</p>`
        }
      }
    }
  }
}

function onErrorGetDir(e) {
    console.log("Error: " + e)
    let errorMessage
    if (e && e.code && e.code === 1) {
      errorMessage = "File or directory not found."
    } else {
      errorMessage = e
    }
    this.errorMessage += `<p>${_TRANSLATE('Error creating directory. Error: ')} ${errorMessage}</p>`
}

function downloadData(content, fileName, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = fileName;
  a.click();
}



