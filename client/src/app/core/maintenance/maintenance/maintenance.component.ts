/// <reference types="cordova-plugin-file" />
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { ProcessMonitorService } from 'src/app/shared/_services/process-monitor.service';
import { UserService } from 'src/app/shared/_services/user.service';
import {SyncService} from "../../../sync/sync.service";
import * as moment from 'moment'
import {VariableService} from "../../../shared/_services/variable.service";
import {SearchService} from "../../../shared/_services/search.service";

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class MaintenanceComponent implements OnInit {

  @ViewChild('indexProgress', {static: true}) indexProgress: ElementRef
  isCordovaApp = false
  storageAvailable
  storageAvailableErrorThreshhold = 1
  displayLowStorageWarning: boolean
  displayPruningComplete: boolean = false
  isStorageThresholdExceeded: boolean
  window: any;
  subscription: any
  indexingMessage = ""
  
  constructor(
    private userService: UserService,
    private processMonitorService: ProcessMonitorService,
    private syncService: SyncService,
    private variableService: VariableService,
    private searchService: SearchService
  ) {
    this.window = window;
  }

  async ngOnInit() {
    this.isCordovaApp = window['isCordovaApp']
    this.displayPruningComplete = false
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
    this.displayPruningComplete = false
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
  async deleteOldRevisions(db, since) {
    return new Promise( (resolve, reject) => {
      db.changes({since: since, limit: 200, include_docs: false})
        .on('change', async function (change) {
          try {
            // const doc = await db.get(change.id)
            const docInfo = await db.db.get(change.id, {revs: true, revs_info: true})
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
                try {
                  const deleted = await db.db.remove(change.id, mostRecentRev)
                  console.log("Deleted rev: " + deleted.rev + " for _id: " + deleted.id)
                } catch (e) {
                  console.error(e)
                }
                // Now save it using the same id:
              delete docInfo._revs_info
              delete docInfo._revisions
              delete docInfo._rev
              
                try {
                  const document = await db.db.put(docInfo)
                  console.log("Updated doc: " + document.rev + " for _id: " + document.id)
                } catch (e) {
                  console.error(e)
                }
            }
          } catch (error) {
            console.error(error)
          }
        })
        .on('complete', async function (info) {
          resolve(info)
        })
        .on('error', function (error) {
          console.log(error);
          reject(error)
        })
    })
  }

  async compact() {
    var sleep = function(delay) { return new Promise((resolve, reject) => setTimeout(resolve, delay))}
    const confirmCheck = confirm(`${_TRANSLATE('This process may take a few minutes - and maybe even longer. Do you wish to continue?')}`);
    if (confirmCheck) {
      const db = await this.userService.getUserDatabase()
      const compactStartTime = new Date().toISOString()
      console.log("compactStartTime: " + compactStartTime)
      // need to track last_seq
      const compactLastSeq = await this.variableService.get('compact-last_seq')
      const lastLocalSequence = (await db.changes({descending: true, limit: 1})).last_seq
      let since = compactLastSeq ? compactLastSeq : 0
      try {
        let processingChanges = true
        while(processingChanges) {
          const progressPercent = Math.round((since/lastLocalSequence)*100)
          let process = this.processMonitorService.start('compact', _TRANSLATE('Compacting database. Progress: ' + progressPercent + '% done.'))
          const changes = await this.deleteOldRevisions(db, since)
          const changesLastSeq = changes["last_seq"]
          await this.variableService.set('compact-last_seq', changesLastSeq)
          if (changes["results"].length > 0) {
            const lastChangeInArray = changes["results"].slice(-1)[0].seq
            const noMoreChanges = lastLocalSequence === lastChangeInArray
            if (!noMoreChanges) {
              since = lastChangeInArray
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
      } catch (e) {
        console.log(e)
      }

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

  /**
   * Deleting any files in the specified paths. Should clean up any old backup files.
   * If there has not been a backup yet, the directories may not have been created. This would throw an error.
   * Does not log any errors. 
   */
  async pruneFiles() {
    const confirmCheck = confirm(`${_TRANSLATE('Have you copied backups to another device? This process will delete any backups in the backups or restore directories. Do you wish to continue?')}`);
    if (confirmCheck) {
      // reset if running this again.
      this.displayPruningComplete = false
      const process = this.processMonitorService.start('pruneFiles', _TRANSLATE('Cleaning up files...'))
      try {
        await this.pruneFilesInPath(window['cordova'].file.externalDataDirectory)
      } catch (e) {
        // console.log("Error pruning files: " + e)
      }
      try {
        await this.pruneFilesInPath(window['cordova'].file.externalRootDirectory + 'Download/restore/')
      } catch (e) {
        // console.log("Error pruning files: " + e)
      }
      try {
        await this.pruneFilesInPath(window['cordova'].file.externalRootDirectory + 'Documents/Tangerine/backups/')
      } catch (e) {
        // console.log("Error pruning files: " + e)
      }
      try {
        await this.pruneFilesInPath(window['cordova'].file.externalRootDirectory + 'Documents/Tangerine/restore/')
      } catch (e) {
        // console.log("Error pruning files: " + e)
      }
      this.processMonitorService.stop(process.id)
      this.displayPruningComplete = true
    }
  }
  
  async pruneFilesInPath(path) {
    return new Promise((resolve, reject) => {
      window['resolveLocalFileSystemURL'](path, (directory) => {
        const reader = (directory as DirectoryEntry).createReader();
        reader.readEntries(
          async function (entries) {
            for (let index = 0; index < entries.length; index++) {
              const entry:Entry = entries[index]
              if (entry.isFile) {
                await (entry as DirectoryEntry).remove(null, null)
              } else {
                const subdir = (entry as DirectoryEntry).createReader();
                subdir.readEntries(
                  async function (entries) {
                    for (let index = 0; index < entries.length; index++) {
                      const entry = entries[index]
                      await (entry as DirectoryEntry).remove(null, null)
                    }
                    resolve(true)
                  },
                  function (err) {
                    reject(err)
                    console.log(err);
                  }
                );
                await (entry as DirectoryEntry).remove(null, null)
              }
            }
            resolve(true)
          },
          function (err) {
            reject(err)
          }
        );
      }, function (err) {
        reject(err)
      });
    })
  }

  async updateSearchIndex() {
    this.subscription = this.searchService.indexingMessage$.subscribe({
      next: (progress) => {
        this.indexingMessage = progress.message || this.indexingMessage
        this.indexProgress.nativeElement.innerHTML = this.indexingMessage
      }
    })
    const index = await this.searchService.indexDocs()
    console.log("Index is complete.")
    // const appConfig = await this.appConfigService.getAppConfig()
    // const groupId = appConfig.groupId
    // await this.searchService.exportSearchIndex(groupId, index);
    this.subscription.unsubscribe();
  }

  async loadSearchIndex() {
    const index = await this.searchService.loadSearchIndex()
    console.log("Index is loaded.")
    // return index
  }

}
