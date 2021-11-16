import { Component, OnInit } from '@angular/core';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { ProcessMonitorService } from 'src/app/shared/_services/process-monitor.service';
import { UserService } from 'src/app/shared/_services/user.service';
import {SyncService} from "../../../sync/sync.service";

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class MaintenanceComponent implements OnInit {

  isCordovaApp = false
  storageAvailable
  storageAvailableErrorThreshhold = 1
  displayLowStorageWarning: boolean
  isStorageThresholdExceeded: boolean
  
  constructor(
    private userService: UserService,
    private processMonitorService: ProcessMonitorService,
    private syncService: SyncService
  ) {
  }

  async ngOnInit() {
    this.isCordovaApp = window['isCordovaApp']
    if (window['isCordovaApp']) {
      const storageStats:any = await this.syncService.getStorageStats()
      this.storageAvailable = storageStats ? (storageStats / (1024*1024)).toFixed(2) : ""
      if (this.storageAvailable < this.storageAvailableErrorThreshhold) {
        this.isStorageThresholdExceeded = true
        this.displayLowStorageWarning = true
      }
    }
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
    await this.pruneFilesInPath(window['cordova'].file.externalRootDirectory + 'Documents/Tangerine/backups/')
    await this.pruneFilesInPath(window['cordova'].file.externalRootDirectory + 'Documents/Tangerine/restore/')
    this.processMonitorService.stop(process.id)
  }
  
  pruneFilesInPath(path) {
    return new Promise((resolve, reject) => {
      window['resolveLocalFileSystemURL'](path, function (directory) {
        const reader = directory.createReader();
        reader.readEntries(
          async function (entries) {
            for (let index = 0; index < entries.length; index++) {
              const entry = entries[index]
              if (entry.isFile) {
                await entry['remove']()
              } else {
                const subdir = entry.createReader();
                subdir.readEntries(
                  async function (entries) {
                    for (let index = 0; index < entries.length; index++) {
                      const entry = entries[index]
                      await entry['remove']()
                    }
                    resolve(true)
                  },
                  function (err) {
                    reject(err)
                    console.log(err);
                  }
                );
                await entry['remove']()
              }
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
