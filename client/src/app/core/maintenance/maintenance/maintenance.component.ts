import { Component, OnInit } from '@angular/core';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { ProcessMonitorService } from 'src/app/shared/_services/process-monitor.service';
import { UserService } from 'src/app/shared/_services/user.service';
import {SyncService} from "../../../sync/sync.service";
import * as moment from 'moment'
import {VariableService} from "../../../shared/_services/variable.service";
import PouchDB from 'pouchdb';
// import MemDownPouch from 'pouchdb-adapter-memory';
// import {MemoryPouchPlugin} from 'pouchdb-adapter-memory';
// import * as PouchdbAdapterMemory from 'pouchdb-adapter-memory';
import index from 'pouchdb-adapter-memory';
import {DeviceService} from "../../../device/services/device.service";
import {DB} from "../../../shared/_factories/db.factory";

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
    private syncService: SyncService,
    private variableService: VariableService,
    private deviceService:DeviceService,
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
    // Keep the progress bar up for a moment so the user knows something happened.
    await sleep(1*1000)
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
    // Keep the progress bar up for a moment so the user knows something happened.
    await sleep(1*1000)
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
    // Keep the progress bar up for a moment so the user knows something happened.
    await sleep(1*1000)
    this.processMonitorService.stop(process.id)
    // Persistent Storage API.
    process = this.processMonitorService.start('permissionCheck', _TRANSLATE('Checking permanent storage permission...'))
    while (!await navigator.storage.persist()) {
      await sleep(1*1000)
    }
    // Keep the progress bar up for a moment so the user knows something happened.
    await sleep(1*1000)
    this.processMonitorService.stop(process.id)
  }

  /**
   * Deletes local revisions except for most recent. Limit: 200.
   * @param db
   * @param since
   */
  async deleteOldRevisions(db, targetDb, startkey, update_seq) {
    const docs = await db.allDocs({startkey: startkey, update_seq: update_seq, limit: 201, include_docs: false})
    for (let i = 0; i < docs.length; i++) {
      // skip the last one - it is for the next run's startKey
      if (i < 201) {
        const doc = docs[i]
        try {
          // const doc = await db.get(change.id)
          const docInfo = await db.db.get(doc.id, {revs: true, revs_info: true})
          const mostRecentRev = docInfo._rev
          const revs = []
          docInfo._revs_info.forEach(revInfo => {
            if (revInfo.status === 'available') {
              if (revInfo.rev !== mostRecentRev) {
                revs.push(revInfo.rev)
              }
            }
          })
          if (revs.length > 0) {
            console.log("_id: " + docInfo._id)
            console.log("_revs_info: " + JSON.stringify(docInfo._revs_info))

            try {
              const result = await db.db.replicate.to(targetDb, {doc_ids: [doc.id]});
              console.log(result);
            } catch (err) {
              console.log(err);
            }
            try {
              const deleted = await db.db.remove(doc.id, mostRecentRev)
              console.log("Deleted rev: " + deleted.rev + " for _id: " + deleted.id)
            } catch (e) {
              console.error(e)
            }
          }
        } catch (error) {
          console.error(error)
        }
      }
      
    }
    return docs
  }
  
async copyDocsFromTargetDB(targetDb, sourceDB, startkey, update_seq) {
    const docs = await targetDb.allDocs({startkey: startkey, update_seq: update_seq, limit: 201, include_docs: false})
    for (let i = 0; i < docs.length; i++) {
      // skip the last one - it is for the next run's startKey
      if (i < 201) {
        const doc = docs[i]
        try {
          // const doc = await db.get(change.id)
          const docInfo = await targetDb.get(doc.id)
          const mostRecentRev = docInfo._rev
          console.log("_id: " + docInfo._id)
            try {
              const result = await targetDb.replicate.to(sourceDB, {doc_ids: [doc.id]});
              console.log(result);
            } catch (err) {
              console.log(err);
            }
            try {
              const deleted = await targetDb.remove(doc.id, mostRecentRev)
              console.log("Deleted rev: " + deleted.rev + " for _id: " + deleted.id)
            } catch (e) {
              console.error(e)
            }
        } catch (error) {
          console.error(error)
        }
      }
      
    }
    return docs
  }

  async compact() {
    var sleep = function(delay) { return new Promise((resolve, reject) => setTimeout(resolve, delay))}
    const confirmCheck = confirm(`${_TRANSLATE('This process may take a few minutes - and maybe even longer. Do you wish to continue?')}`);
    if (confirmCheck) {
      let db = await this.userService.getUserDatabase()
      const device = await this.deviceService.getDevice()

      // const targetDB = new PouchDB('temp', {revs_limit: 1});
      const targetDB = DB('temp', device.key, {revs_limit: 1});
      const compactStartTime = new Date().toISOString()
      console.log("compactStartTime: " + compactStartTime)
      const update_seq = (await db.changes({descending: true, limit: 1})).last_seq
      let docNum = 0 
      let startkey = 0
      try {
        let processingChanges = true
        while (processingChanges) {
          // const progressPercent = Math.round((since/lastLocalSequence)*100)
          const progressPercent = ""
          let process = this.processMonitorService.start('compact', _TRANSLATE('Compacting database. Progress: ' + progressPercent + '% done.'))
          // startkey: startkey, update_seq: update_seq
          const docs = await this.deleteOldRevisions(db, targetDB, startkey, update_seq)
          if (docs.length > 0) {
            docNum = docNum + (docs.length - 1)
            startkey = docs.slice(-1)[0]._id
            const noMoreChanges = docs.length < 201
            if (!noMoreChanges) {
              processingChanges = true
            } else {
              processingChanges = false
            }
            this.processMonitorService.stop(process.id)
          } else {
            this.processMonitorService.stop(process.id)
            processingChanges = false
          }
        }
        let process = this.processMonitorService.start('compact', _TRANSLATE('Records transferred to target db. Now rebuilding source DB'))
        await sleep(1*1000)
        this.processMonitorService.stop(process.id)
        try {
          await db.db.destroy()
        } catch (err) {
          console.log(err);
        }
        
      } catch (e) {
        console.log(e)
      }
      try {
        await targetDB.destroy()
      } catch (err) {
        console.log(err);
      }
      db = await this.userService.getUserDatabase()
      
      const compactStopTime = new Date().toISOString()
      console.log("compactStopTime: " + compactStopTime)
      const start = moment(compactStartTime)
      const end = moment(compactStopTime)
      const diff = end.diff(start)
      const duration = moment.duration(diff).as('milliseconds')
      console.log("duration in milliseconds: " + duration)

      let process = this.processMonitorService.start('compact', _TRANSLATE('Compacting databases complete. '))
      await sleep(1*1000)
      this.processMonitorService.stop(process.id)
    }
  }

  async pruneFiles() {
    const confirmCheck = confirm(`${_TRANSLATE('Have you copied backups to another device? This process will delete any backups in the backups or restore directories. Do you wish to continue?')}`);
    if (confirmCheck) {
      const process = this.processMonitorService.start('pruneFiles', _TRANSLATE('Pruning files...'))
      await this.pruneFilesInPath(window['cordova'].file.externalDataDirectory)
      await this.pruneFilesInPath(window['cordova'].file.externalRootDirectory + 'Download/restore/')
      await this.pruneFilesInPath(window['cordova'].file.externalRootDirectory + 'Documents/Tangerine/backups/')
      await this.pruneFilesInPath(window['cordova'].file.externalRootDirectory + 'Documents/Tangerine/restore/')
      this.processMonitorService.stop(process.id)
    }
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
