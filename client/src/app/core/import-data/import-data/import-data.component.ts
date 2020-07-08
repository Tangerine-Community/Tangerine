import { Component, OnInit } from '@angular/core';
import {_TRANSLATE} from "../../../shared/translation-marker";
import {AppConfigService} from "../../../shared/_services/app-config.service";
const SHARED_USER_DATABASE_NAME = 'shared-user-database';
const USERS_DATABASE_NAME = 'users';
const LOCKBOX_DATABASE_NAME = 'tangerine-lock-boxes';
declare const cordova: any;
@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.css']
})
export class ImportDataComponent implements OnInit {
  window:any;
  constructor(private appConfigService: AppConfigService) {
    this.window = window;
  }

  ngOnInit(): void {
    console.log("ImportDataComponent init.")
  }

  async importBackups() {
    if (!confirm(_TRANSLATE('Are you sure you want to restore this backup? It will wipe any data already in Tangerine.'))) {
      return
    }
    const appConfig = await this.appConfigService.getAppConfig()
    if (window['isCordovaApp'] && appConfig.syncProtocol === '2') {
      const dbNames = [SHARED_USER_DATABASE_NAME, USERS_DATABASE_NAME, LOCKBOX_DATABASE_NAME]
      for (const dbName of dbNames) {
        // copy the database
        console.log(`copying ${dbName} db over to the protected accessible fs`)
        // tslint:disable-next-line:max-line-length
        this.window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + 'Download/restore' + dbName, (fileEntry) => {
          this.window.resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory + 'databases/', function (directory) {
            fileEntry.copyTo(directory, dbName, function() {
                console.log('DB Copied!');
                alert(`${_TRANSLATE('File Stored At')} ${cordova.file.applicationStorageDirectory}/databases/${dbName}`);
              },
              function(e) {
                console.log('Unable to copy DB');
                alert(`${_TRANSLATE('Write Failed: ')}` + e.toString());
              });
          }, null);
        }, null);
      }
    }
  }
}
