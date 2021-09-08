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

  constructor(
    private userService: UserService,
    private syncingService: SyncingService,
    private appConfigService: AppConfigService
  ) {
    this.window = window;
  }

  ngOnInit() {
  }
  
  async exportAllRecords() {
    const appConfig = await this.appConfigService.getAppConfig()
    const dbNames = [SHARED_USER_DATABASE_NAME, SHARED_USER_DATABASE_INDEX_NAME, USERS_DATABASE_NAME, LOCKBOX_DATABASE_NAME, VARIABLES_DATABASE_NAME]
    if (window['isCordovaApp'] && appConfig.syncProtocol === '2' && !window['turnOffAppLevelEncryption']) {
      for (const dbName of dbNames) {
        // copy the database
        console.log(`copying ${dbName} db over to the user accessible fs`)
        // tslint:disable-next-line:max-line-length
        this.window.resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory + 'databases/' + dbName, (fileEntry) => {
          this.window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (directory) {
            fileEntry.copyTo(directory, dbName, function() {
                console.log('DB Copied!');
                alert(`${_TRANSLATE('File Stored At')} ${cordova.file.externalDataDirectory}${dbName}`);
              },
              function(e) {
                console.log('Unable to copy DB');
                alert(`${_TRANSLATE('Write Failed: ')}` + e.toString());
              });
          }, null);
        }, null);
      }
    } else {
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
          console.log('Successfully dumped : ' + dbName);
          const file = new Blob([data], {type: 'application/json'});
          // const currentUser = this.userService.getCurrentUser();
          const now = new Date();
          const fileName =
            `${dbName}_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.json`;
          
          if (this.window.isCordovaApp) {
            document.addEventListener('deviceready', () => {
              this.window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, (directoryEntry) => {
                directoryEntry.getFile(fileName, {create: true}, (fileEntry) => {
                  fileEntry.createWriter((fileWriter) => {
                    fileWriter.onwriteend = (data) => {
                      alert(`${_TRANSLATE('File Stored At')} ${cordova.file.externalDataDirectory}${fileName}`);
                    };
                    fileWriter.onerror = (e) => {
                      alert(`${_TRANSLATE('Write Failed')}` + e.toString());
                    };
                    fileWriter.write(data);
                  });
                });
              });
            }, false);
          } else {
            downloadData(file, fileName, 'application/json');
          }
        } catch (e) {
          console.log("Error dumping data: " + e)
        }
      }
    }
  }
}

function downloadData(content, fileName, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = fileName;
  a.click();
}



