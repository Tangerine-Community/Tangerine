import { Component, OnInit } from '@angular/core';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { ProcessMonitorService } from 'src/app/shared/_services/process-monitor.service';
import { UserService } from 'src/app/shared/_services/user.service';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class MaintenanceComponent implements OnInit {

  isCordovaApp = false

  constructor(
    private userService: UserService,
    private processMonitorService: ProcessMonitorService
  ) {
  }

  ngOnInit(): void {
    this.isCordovaApp = window['isCordovaApp']
  }

  async compact() {
    const process = this.processMonitorService.start('compact', _TRANSLATE('Compacting databases...'))
    const db = await this.userService.getUserDatabase()
    await db.db.compact()
    this.processMonitorService.stop(process.id)
  }

  async pruneFiles() {
    const process = this.processMonitorService.start('pruneFiles', _TRANSLATE('Pruning files...'))
    await this.pruneFilesInPath(window['cordova'].file.externalDataDirectory)
    await this.pruneFilesInPath(window['cordova'].file.externalRootDirectory + 'Download/restore/')
    this.processMonitorService.stop(process.id)
  }
  
  pruneFilesInPath(path) {
    return new Promise((resolve, reject) => {
      window['resolveLocalFileSystemURL'](path, function (directory) {
        var reader = directory.createReader();
        reader.readEntries(
          async function (entries) {
            console.log(entries);
            for (let entry in entries) {
              await entry['removeEntry']()
            }
            resolve(true) 
          },
          function (err) {
            reject(err)
            console.log(err);
          }
        );
      }, null);
    })
  }

}
