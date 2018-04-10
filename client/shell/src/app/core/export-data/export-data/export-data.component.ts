import { Component, OnInit } from '@angular/core';
import { UserService } from '../../auth/_services/user.service';
import { SyncingService } from '../../sync-records/_services/syncing.service';
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
    const file = new Blob([data], { type: 'application/json' });
    const fileName = 'download.json';
    if (window.isCordovaApp) {
      document.addEventListener('deviceready', () => {
        // const filePath = `${cordova.file.dataDirectory}download.json`;
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, (directoryEntry) => {
          directoryEntry.getFile(fileName, { create: true }, (fileEntry) => {
            fileEntry.createWriter((fileWriter) => {
              fileWriter.onwriteend = (data) => {
                alert(`File stored at ${cordova.file.dataDirectory}${fileName}`);
              };
              fileWriter.onerror = (e) => {
                alert(`Write Failed:` + e.toString());
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
