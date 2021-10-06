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
      this["accessingDirectory"] = "Documents"
      this.window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + 'Documents', (directoryEntry) => {
        directoryEntry.getDirectory('Tangerine', { create: true }, (dirEntry) => {
          dirEntry.getDirectory('backups', { create: true }, (subDirEntry) => {
          }, this.onErrorGetDir);
          dirEntry.getDirectory('restore', { create: true }, (subDirEntry) => {
          }, this.onErrorGetDir);
        }, this.onErrorGetDir);
      }, this.onErrorGetDir.bind(this))
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
            console.log("Error: " + JSON.stringify(e))
            this.errorMessage += `<p>${_TRANSLATE('Error restoring db ')} : ${dbName} to restoreLocation:  ${restoreLocation} Message: ${JSON.stringify(e)}</p>`
          });
        }, (e) => {
          this.success = false
          let message = ""
          if (e.code) {
            if (e.code === 1) {
              message = " Backup file not found. "
            }
          }
          console.log(message + "Error: " + JSON.stringify(e))
          this.errorMessage += `<p>${_TRANSLATE('Error restoring db ')} : ${dbName} to restoreLocation:  ${restoreLocation} ${message} Error: ${JSON.stringify(e)}</p>`
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

    const dumpFiles = []
    let copiedDbs = []

    if (this.window.isCordovaApp) {
      for (var i = 0; i < dirEntries.length; i++) {
        let entry = dirEntries[i]
        // const stream = fileObject.stream();
        let restoreDirRootPath, restoreDbDirEntries: any[]
        console.log("processing directory: " + entry.name)
        this.statusMessage += "<p>" + _TRANSLATE("Processing Directory: ") + entry.name + "</p>"
        // const fileNameArray = entry.name.split('_')
        const dbName = entry.name
        console.log(`Restoring ${dbName} db`)
        const db = DB(dbName)
        // for Cordova, must fetch the dirs per db
        restoreDirRootPath = cordova.file.externalRootDirectory + 'Documents/Tangerine/restore/' + dbName
        const restoreDbDirHandle: any = await new Promise(resolve =>
          this.window.resolveLocalFileSystemURL(restoreDirRootPath, resolve)
        );
        restoreDbDirEntries = await new Promise(resolve => {
          const reader = restoreDbDirHandle.createReader();
          reader.readEntries((entries) => resolve(entries))
        });
        restoreDbDirEntries.sort((a, b) => (a.name > b.name) ? 1 : -1)
        for (var j = 0; j < restoreDbDirEntries.length; j++) {
          let entry = restoreDbDirEntries[j]
          await this.restoreDumpfile(entry, dumpFiles, db);
        }
        copiedDbs.push(dbName)
        console.log("finished processing files for " + dbName)
      }
    } else {
      // browser-based code does a recursive search for files. 
      // cordova only returns the top-level dirs.
      const dirEntriesArray = [...dirEntries]
      const webDirEntries = {}
      this.dbNames.forEach(dbName => {
        const entries = dirEntriesArray.filter(entry => {
          const pathArray = entry.webkitRelativePath.split("/")
          if (pathArray[1] === dbName) {
            return entry
          }
        })
        webDirEntries[dbName] = entries
      })
      const webDirDbNames = Object.keys(webDirEntries)
      for (var i = 0; i < webDirDbNames.length; i++) {
        const dbName = webDirDbNames[i]
        // console.log(`${property}: ${object[property]}`);
        console.log("processing directory: " + dbName)
        this.statusMessage += "<p>" + _TRANSLATE("Processing Directory: ") + dbName + "</p>"
        console.log(`Restoring ${dbName} db`)
        const db = DB(dbName)
        const restoreDbDirEntries = webDirEntries[dbName]
        restoreDbDirEntries.sort((a, b) => (a.name > b.name) ? 1 : -1)
        for (var j = 0; j < restoreDbDirEntries.length; j++) {
          let entry = restoreDbDirEntries[j]
          await this.restoreDumpfile(entry, dumpFiles, db);
        }
        copiedDbs.push(dbName)
        console.log("finished processing files for " + dbName)
      }
    }

    if (copiedDbs.length === this.dbNames.length) {
      this.statusMessage += `<p>${_TRANSLATE("Finished restoring backups. Please wait for indexing to complete.")}</p>`
    }
  }

  private async restoreDumpfile(entry, dumpFiles: any[], db) {
    console.log("processing " + entry.name)
    dumpFiles.push(entry.name)
    this.statusMessage += "<p>" + _TRANSLATE("Processing ") + entry.name + "</p>"
    // const fileProcessStatus: any = await new Promise(resolve => {
    let fileObj
    if (this.window.isCordovaApp) {
      fileObj = await new Promise(resolve => {
        entry.file(resolve);
      })
    } else {
      fileObj = entry
    }
    // entry.file(async (file) => {
    const dumpfileText = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        resolve(e.target.result)
      };
      reader.readAsText(fileObj)
    })
    const result = await new Promise(resolve => {
      db.loadIt(dumpfileText)
      resolve("Finished processing dumpfile: " + entry.name)
    })
    console.log(result)
    this.progressMessage = result.toString()
  }

  onErrorGetDir(e) {
    let errorMessage
    if (e && e.code && e.code === 1) {
      errorMessage = this["accessingDirectory"] ? this["accessingDirectory"] + " directory not found. Please exit the app, create the " + this["accessingDirectory"] + "  directory, and return." : "File or directory not found."
    } else {
      errorMessage = JSON.stringify(e)
    }
    console.log("Error: " + errorMessage)
    this.errorMessage += `<p>${_TRANSLATE('Error creating directory. Error: ')} ${errorMessage}</p>`
  }
  
}
