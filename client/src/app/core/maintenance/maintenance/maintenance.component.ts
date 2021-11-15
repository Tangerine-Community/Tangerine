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

  async checkPermissions() {
    var sleep = function(delay) { return new Promise((resolve, reject) => setTimeout(resolve, delay))}
    // Notifications API.
    let process = this.processMonitorService.start('permissionCheck', _TRANSLATE('Checking notifications permission...'))
    while((await Notification.requestPermission()) === 'denied') {
      // Do nothing.
      await sleep(1*1000)
    }
    this.processMonitorService.stop(process.id)
    // Camera and Microphone API.
    process = this.processMonitorService.start('permissionCheck', _TRANSLATE('Checking camera permission...'))
    while ((await navigator.permissions.query({name:'camera'})).state !== 'granted') {
      navigator.getUserMedia(
        {
            video: true,
            audio: false
        },
        function() { },
        function() { }
      )
      await sleep(1*1000)
    }
    this.processMonitorService.stop(process.id)
    // Geolocation API.
    process = this.processMonitorService.start('permissionCheck', _TRANSLATE('Checking geolocation permission...'))
    while ((await navigator.permissions.query({name:'geolocation'})).state !== 'granted') {
      try {
        navigator.geolocation.getCurrentPosition(() => { })
      } catch (e) {
        // Do nothing.
      }
      await sleep(1*1000)
    }
    this.processMonitorService.stop(process.id)
    // Persistent Storage API.
    process = this.processMonitorService.start('permissionCheck', _TRANSLATE('Checking permanent storage permission...'))
    while (!await navigator.storage.persist()) {
      await sleep(1*1000)
    }
    this.processMonitorService.stop(process.id)
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
