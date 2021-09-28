import {Component, Input, OnInit} from '@angular/core';
import {_TRANSLATE} from "../../../shared/translation-marker";
import {AppConfigService} from "../../../shared/_services/app-config.service";
import {DB} from "../../../shared/_factories/db.factory";
import {SyncService} from "../../../sync/sync.service";
const SHARED_USER_DATABASE_NAME = 'shared-user-database';
const USERS_DATABASE_NAME = 'users';
const LOCKBOX_DATABASE_NAME = 'tangerine-lock-boxes';
const VARIABLES_DATABASE_NAME = 'tangerine-variables';
declare const cordova: any;
@Component({
  selector: 'app-restore-backup',
  templateUrl: './restore-backup.component.html',
  styleUrls: ['./restore-backup.component.css']
})
export class RestoreBackupComponent implements OnInit {
  window:any;
  constructor(
    private appConfigService: AppConfigService,
  private syncService: SyncService
  ) {
    this.window = window;
  }
  statusMessage: string
  progressMessage: string
  errorMessage: string
  success: boolean
  showDirectoryDialog: boolean
  dbNames = [SHARED_USER_DATABASE_NAME, USERS_DATABASE_NAME, LOCKBOX_DATABASE_NAME, VARIABLES_DATABASE_NAME]
  restoreDir: string = 'Documents/Tangerine/restore/'
  rootDirEntry
  subscription: any // messages from sync.service
  indexing: any // messages from sync.service
  indexingMessage: string // messages from sync.service
  otherMessage: any // messages from sync.service
  
  ngOnInit(): void {
    // console.log("RestoreBackupComponent init")
    this.statusMessage = ''
    this.progressMessage = ''
    this.errorMessage = ''
    this.success = false
    this.indexingMessage = ''
    this.otherMessage = ''
    
    if (this.window.isCordovaApp) {
      this.window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + 'Documents', (directoryEntry) => {
        directoryEntry.getDirectory('Tangerine', { create: true }, (dirEntry) => {
          dirEntry.getDirectory('backups', { create: true }, (subDirEntry) => {
          }, this.onErrorGetDir);
          dirEntry.getDirectory('restore', { create: true }, (subDirEntry) => {
          }, this.onErrorGetDir);
        }, this.onErrorGetDir);
      })
    }
  }

  async importBackups() {
    this.statusMessage = ''
    this.progressMessage = ''
    this.errorMessage = ''
    this.indexingMessage = ''
    this.otherMessage = ''
    
    if (!confirm(_TRANSLATE('Are you sure you want to restore this backup? It will wipe any data already in Tangerine.'))) {
      return
    }

    if (this.window.isCordovaApp) {
      this.subscription = this.syncService.syncMessage$.subscribe({
        next: (progress) => {
          if (progress) {
            if (typeof progress.message !== 'undefined') {
              this.progressMessage = progress.message
            }
            if (progress.indexing) {
              this.indexingMessage = 'Indexing ' + progress.indexing.view + " Doc Count: " + progress.indexing.countIndexedDocs + " Sequence Number: " + progress.indexing.last_seq
            } else {
              this.indexingMessage = ''
            }
          }
        }
      })
    }
    
    const appConfig = await this.appConfigService.getAppConfig()
    if (window['isCordovaApp'] && appConfig.syncProtocol === '2' && !window['turnOffAppLevelEncryption']) {
      const len = this.dbNames.length
      let copiedDbs = []
      for (let index = 0; index < this.dbNames.length; index++) {
        const dbName = this.dbNames[index]
        // copy the database
        const restoreLocation = cordova.file.externalRootDirectory + 'Documents/Tangerine/restore/' + dbName;
        const databasesLocation = cordova.file.applicationStorageDirectory + 'databases/';
        this.window.resolveLocalFileSystemURL(restoreLocation, (fileEntry) => {
          this.window.resolveLocalFileSystemURL(databasesLocation, (directory) => {
            fileEntry.copyTo(directory, dbName, async () => {
                this.success = true
                console.log(`${dbName} copied!`);
                this.statusMessage += `<p>${_TRANSLATE('File restored from ')} ${directory.fullPath}${dbName}</p>`
                copiedDbs.push(dbName)
                if (copiedDbs.length === len) {
                  this.statusMessage += `<p>${_TRANSLATE('Done! Please exit the app and restart.')}</p>`
                }
              },
              (e) => {
                this.success = false
                console.log('Unable to copy DB ' + dbName);
                this.errorMessage += `<p>${_TRANSLATE('Error restoring db ')} : ${dbName} to restoreLocation:  ${restoreLocation} Is Backup a File?: ${fileEntry.isFile} Message: ${JSON.stringify(e)}</p>`
              });
          }, (e) => {
            this.success = false
            console.log("Error: " + e)
            this.errorMessage += `<p>${_TRANSLATE('Error restoring db ')} : ${dbName} to restoreLocation:  ${restoreLocation} Message: ${JSON.stringify(e)}</p>`
          });
        }, (e) => {
          this.success = false
          console.log("Error: " + e)
          this.errorMessage += `<p>${_TRANSLATE('Error restoring db ')} : ${dbName} to restoreLocation:  ${restoreLocation} Message: ${JSON.stringify(e)}</p>`
        });
      }
    } else {
      if (this.window.isCordovaApp) {
        const path = cordova.file.externalRootDirectory + 'Documents/Tangerine/restore/'
        this.rootDirEntry = await new Promise(resolve =>
          this.window.resolveLocalFileSystemURL(path, resolve)
        );
        const restoreDirEntries: any[] = await new Promise(resolve => {
          const reader = this.rootDirEntry.createReader();
          reader.readEntries((entries) => resolve(entries))
        });
        // console.log(JSON.stringify(restoreDirEntries));
        try {
          await this.restoreBackups(restoreDirEntries)
          this.statusMessage += `<p>${_TRANSLATE("Optimizing data. This may take several minutes. Please wait...")}</p>`
          await this.syncService.indexViews("admin")
          this.progressMessage = `${_TRANSLATE("Done! Please exit the app and restart.")}`
          this.statusMessage += `<p>${_TRANSLATE("Done! Please exit the app and restart.")}</p>`

        } catch (e) {
          console.log(e);
          this.errorMessage += `<p>${_TRANSLATE('Error restoring backup')} Message: ${JSON.stringify(e)}</p>`
        }
      } else {
        this.showDirectoryDialog = true
      }
    }
  }

  async restoreBackups(dirEntries: any[]) {
    let copiedDbs = []
    for (var i = 0; i < dirEntries.length; i++) {
      const dumpFiles = []
      let entry = dirEntries[i]
      console.log("processing directory: " + entry.name)
      this.statusMessage += "<p>" + _TRANSLATE("Processing Directory: ") + entry.name + "</p>"
      // const fileNameArray = entry.name.split('_')
      const dbName = entry.name
      console.log(`Restoring ${dbName} db`)
      const db = DB(dbName)
      // const stream = fileObject.stream();
      if (this.window.isCordovaApp) {
        const path = cordova.file.externalRootDirectory + 'Documents/Tangerine/restore/' + dbName
        const restoreDbDirHandle: any = await new Promise(resolve =>
          this.window.resolveLocalFileSystemURL(path, resolve)
        );
        const restoreDbDirEntries: any[] = await new Promise(resolve => {
          const reader = restoreDbDirHandle.createReader();
          reader.readEntries((entries) => resolve(entries))
        });
        restoreDbDirEntries.sort((a, b) => (a.name > b.name) ? 1 : -1)
        for (var j = 0; j < restoreDbDirEntries.length; j++) {
          let entry = restoreDbDirEntries[j]
          console.log("processing " + entry.name)
          dumpFiles.push(entry.name)
          this.statusMessage += "<p>" + _TRANSLATE("Processing ") + entry.name + "</p>"
          // const fileProcessStatus: any = await new Promise(resolve => {
          const fileObj:any = await new Promise(resolve => {
            entry.file(resolve);
          })
          // entry.file(async (file) => {
          const reader = new FileReader();
          let progressMessage = this.progressMessage
          reader.onloadend = async function () {
            // console.log("Successful file read: " + this.result);
            console.log('Processing Dumpfile: ' + entry.name)
            progressMessage = 'Processing Dumpfile: ' + entry.name
            const result = await new Promise(resolve => {
              db.loadIt(this.result)
              resolve("Finished process dumpfile.")
            })
          };
          reader.readAsText(fileObj)
          // })
          // })
          // await promisify()
        }
        copiedDbs.push(dbName)
        console.log("finished processing files for " + dbName)
        if (copiedDbs.length === this.dbNames.length) {
          this.statusMessage += `<p>${_TRANSLATE("Finished restoring backups. Please wait for indexing to complete.")}</p>`
        }
      } else {
        // const len = this.dbNames.length
        // const reader = new FileReader();
        // reader.addEventListener('load', async (event) => {
        //   const result = event.target.result;
        //   const stream = new window['Memorystream']
        //   stream.end(result);
        //   // copy the database
        //   console.log(`Restoring ${dbName} db`)
        //   const db = DB(dbName)
        //   try {
        //     await db.load(stream)
        //     this.statusMessage += `<p>${dbName} ${_TRANSLATE("restored")}</p>`
        //     copiedDbs.push(dbName)
        //     if (copiedDbs.length === len) {
        //       this.statusMessage += `<p>${_TRANSLATE("Finished restoring backups. Please wait for indexing to complete.")}</p>`
        //     }
        //   } catch (e) {
        //     console.log("Error loading db: " + e)
        //     this.errorMessage += '<p>' + _TRANSLATE("Error restoring backup database. Message: ") + JSON.stringify(e) + '</p>'
        //   }
        // });
        // await reader.readAsText(entry);
      }
    }
  }

  onErrorGetDir(e) {
    console.log("Error: " + e)
    let errorMessage
    if (e && e.code && e.code === 1) {
      errorMessage = "File or directory not found."
    } else {
      errorMessage = e
    }
    this.errorMessage += `<p>${_TRANSLATE('Error creating directory. Error: ')} ${errorMessage}</p>`
  }
  
}
