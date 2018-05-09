import { Component, OnInit } from '@angular/core';
import { UserService } from '../../auth/_services/user.service';
import { SyncingService } from '../../sync-records/_services/syncing.service';
import { _TRANSLATE } from '../../../shared/translation-marker';
declare const cordova: any;
@Component({
  selector: 'app-export-data',
  templateUrl: './export-data.component.html',
  styleUrls: ['./export-data.component.css']
})
export class ExportDataComponent implements OnInit {

  constructor(private userService: UserService, private syncingService: SyncingService) { }

  ngOnInit() {
  }
  async exportAllRecords() {
    const usernames = await this.userService.getUsernames();
    const data = await Promise.all(usernames.map(async databaseName => {
      const docs = await this.syncingService.getAllUsersDocs(databaseName);
      return {
        databaseName,
        docs
      };
    }));
    const file = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const currentUser = await localStorage.getItem('currentUser');
    const now = new Date();
    const fileName =
      `${currentUser}-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.json`;
    if (window.isCordovaApp) {
      document.addEventListener('deviceready', () => {
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, (directoryEntry) => {
          directoryEntry.getFile(fileName, { create: true }, (fileEntry) => {
            fileEntry.createWriter((fileWriter) => {
              fileWriter.onwriteend = (data) => {
                alert(`${_TRANSLATE('fileStoredAt')} ${cordova.file.externalDataDirectory}${fileName}`);
              };
              fileWriter.onerror = (e) => {
                alert(`${_TRANSLATE('writeFailed')}` + e.toString());
              };
              fileWriter.write(file);
            });
          });
        });
      }, false);
    } else {
      downloadData(file, fileName, 'application/json');
    }

  }
}

function downloadData(content, fileName, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = fileName;
  a.click();
}
