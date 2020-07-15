import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/_services/user.service';
import { SyncingService } from '../../sync-records/_services/syncing.service';
import { _TRANSLATE } from '../../../shared/translation-marker';
import {AppConfigService} from '../../../shared/_services/app-config.service';
import {VariableService} from "../../../shared/_services/variable.service";
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
    private appConfigService: AppConfigService,
    private variableService: VariableService,
  ) {
    this.window = window;
  }

  ngOnInit() {
  }
  async exportAllRecords() {
    const appConfig = await this.appConfigService.getAppConfig()
    if (window['isCordovaApp'] && appConfig.syncProtocol === '2') {
      const dbNames = [SHARED_USER_DATABASE_NAME, SHARED_USER_DATABASE_INDEX_NAME, USERS_DATABASE_NAME, LOCKBOX_DATABASE_NAME, VARIABLES_DATABASE_NAME]
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
      const usernames = await this.userService.getUsernames();
      const data = await Promise.all(usernames.map(async databaseName => {
        const docs = await this.syncingService.getAllUsersDocs(databaseName);
        return {
          databaseName,
          docs
        };
      }));
      const file = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const currentUser = await this.variableService.get('currentUser');
      const now = new Date();
      const fileName =
        `${currentUser}-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.json`;
      if (this.window.isCordovaApp) {
        document.addEventListener('deviceready', () => {
          this.window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, (directoryEntry) => {
            directoryEntry.getFile(fileName, { create: true }, (fileEntry) => {
              fileEntry.createWriter((fileWriter) => {
                fileWriter.onwriteend = (data) => {
                  alert(`${_TRANSLATE('File Stored At')} ${cordova.file.externalDataDirectory}${fileName}`);
                };
                fileWriter.onerror = (e) => {
                  alert(`${_TRANSLATE('Write Failed')}` + e.toString());
                };
                fileWriter.write(JSON.stringify(data));
              });
            });
          });
        }, false);
      } else {
        downloadData(file, fileName, 'application/json');
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
