import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/_services/user.service';
import { SyncingService } from '../../sync-records/_services/syncing.service';
import { _TRANSLATE } from '../../../shared/translation-marker';
import {AppConfigService} from '../../../shared/_services/app-config.service';
import { DB } from '../../../shared/_factories/db.factory'
import {ReplicationStatus} from "../../../sync/classes/replication-status.class";

const SHARED_USER_DATABASE_NAME = 'shared-user-database';
const SHARED_USER_DATABASE_INDEX_NAME = 'shared-user-database-index';
const USERS_DATABASE_NAME = 'users';
const LOCKBOX_DATABASE_NAME = 'tangerine-lock-boxes';
const VARIABLES_DATABASE_NAME = 'tangerine-variables';

declare const cordova: any;
@Component({
  selector: 'app-export-data',
  templateUrl: './export-data.component.html',
  styleUrls: ['./export-data.component.css']
})
export class ExportDataComponent implements OnInit {

  window:any;
  statusMessage: string
  progressMessage: string
  errorMessage: string
  backupDir: string = 'Documents/Tangerine/backups/'
  DEFAULT_BATCH_SIZE = 50;
  LIMIT = 5000;
  constructor(
    private userService: UserService,
    private syncingService: SyncingService,
    private appConfigService: AppConfigService
  ) {
    this.window = window;
  }

  ngOnInit() {
    this.statusMessage = ''
    this.progressMessage = ''
    this.errorMessage = ''
    
    if (this.window.isCordovaApp) {
      this.backupDir = 'Documents/Tangerine/backups/'
    } else {
      this.backupDir = `${_TRANSLATE('Click button to start download to desired directory.')} `
    }
    
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
  
  async exportAllRecords() {
    this.statusMessage = ''
    this.progressMessage = ''
    this.errorMessage = ''
    const appConfig = await this.appConfigService.getAppConfig()
    const dbNames = [SHARED_USER_DATABASE_NAME, SHARED_USER_DATABASE_INDEX_NAME, USERS_DATABASE_NAME, LOCKBOX_DATABASE_NAME, VARIABLES_DATABASE_NAME]
    // APK's that use in-app encryption
    if (window['isCordovaApp'] && appConfig.syncProtocol === '2' && !window['turnOffAppLevelEncryption']) {
      const backupLocation = cordova.file.externalRootDirectory + this.backupDir;
      for (const dbName of dbNames) {
        // copy the database
        console.log(`copying ${dbName} db over to the user accessible fs`)
        // tslint:disable-next-line:max-line-length
        this.window.resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory + 'databases/' + dbName, (fileEntry) => {
          this.window.resolveLocalFileSystemURL(backupLocation, (directory) => {
            fileEntry.copyTo(directory, dbName, () => {
                console.log('DB Copied!');
                // alert(`${_TRANSLATE('File Stored At')} ${cordova.file.externalDataDirectory}${dbName}`);
                this.statusMessage += `<p>${_TRANSLATE('DB Copied to ')} ${cordova.file.externalDataDirectory}${dbName}</p>`
              }, (e) => {
                console.log('Unable to copy DB');
                alert(`${_TRANSLATE('Write Failed: ')}` + e.toString());
              });
          }, null);
        }, null);
      }
    } else {
      // APK's or PWA's that do not use in-app encryption - have turnOffAppLevelEncryption:true in app-config.json
      for (let index = 0; index < dbNames.length; index++) {
        const stream = new window['Memorystream']
        let data = '';
        stream.on('data', function(chunk) {
          data += chunk.toString();
        });
        const dbName = dbNames[index]
        // copy the database
        console.log(`exporting ${dbName} db over to the user accessible fs`)
        const db = DB(dbName)
        try {
          // await db.dump(stream)
          // console.log('Successfully exported : ' + dbName);
          // this.statusMessage += `<p>${_TRANSLATE('Successfully exported database ')} ${dbName}</p>`
          // const file = new Blob([data], {type: 'application/json'});
          const now = new Date();
          const fileName =
            `${dbName}_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.json`;
          if (this.window.isCordovaApp) {
            const backupLocation = cordova.file.externalRootDirectory + this.backupDir;
            // this.window.resolveLocalFileSystemURL(backupLocation, (directoryEntry) => {
              
              const opts = {
                batch_size: this.DEFAULT_BATCH_SIZE,
                include_docs: true,
                limit: this.LIMIT
              }
              let status = <ReplicationStatus>{
                pulled: 0,
                info: ''
              }
              try {
                status = await this.dump(dbName, backupLocation, fileName, opts)
                this.statusMessage += `<p>${_TRANSLATE(' Completed backup at ')} ${backupLocation}${fileName}. ${_TRANSLATE('last_seq: ')} ${status.pulled} </p>`
                this.window.resolveLocalFileSystemURL(backupLocation, (directoryEntry) => {
                  directoryEntry.getFile(fileName, {create: true, exclusive: false}, (fileEntry) => {
                    fileEntry.createWriter((fileWriter) => {
                      fileWriter.onwriteend = (data) => {
                        this.progressMessage = `<p>${_TRANSLATE('Change: ')} ${status.pulled} ${_TRANSLATE('Stored At')} ${backupLocation}${fileName} </p>`
                      };
                      fileWriter.onerror = (e) => {
                        alert(`${_TRANSLATE('Write Failed')}` + e.toString());
                        this.errorMessage += `<p>${_TRANSLATE('Write Failed')}` + e.toString() + "</p>"
                      };
                      // fileWriter.write(file);
                      // fileWriter.seek(fileWriter.length);
                      fileWriter.write(JSON.stringify(status.info.results) + "\n");
                    });
                  });
                }, (e) => {
                  console.log("Error: " + e)
                  let errorMessage
                  if (e && e.code && e.code === 1) {
                    errorMessage = "File or directory not found."
                  } else {
                    errorMessage = e
                  }
                  this.errorMessage += `<p>${_TRANSLATE('Error exporting file: ')} ${fileName} ${_TRANSLATE(' at backup location: ')} ${backupLocation}  ${_TRANSLATE(' Error: ')} ${errorMessage}</p>`
                });
              } catch (e) {
                console.log("Error: " + e)
              }
              // do we use info.last_seq when splitting up files?
              // pulled: info.docs_written,
            console.log("status: " + JSON.stringify(status))
            
          } else {
            await db.dump(stream)
            console.log('Successfully exported : ' + dbName);
            this.statusMessage += `<p>${_TRANSLATE('Successfully exported database ')} ${dbName}</p>`
            const file = new Blob([data], {type: 'application/json'});
            this.downloadData(file, fileName, 'application/json');
          }
        } catch (e) {
          console.log("Error: " + e)
          this.errorMessage += `<p>${_TRANSLATE('Error: ')} ${JSON.stringify(e)}</p>`
        }
      }
    }
  }

  async dump(dbName, backupLocation, fileName, opts):Promise<ReplicationStatus> {
    return new Promise((resolve, reject) => {
      const db = DB(dbName)

      // const chain = db.info().then((info) => {
        // return db.replicate.to(output, opts);
      db.changes(opts).on('change', (change) => {
        // handle change
        
      }).on('complete', (info) => {
        // do we use info.last_seq when splitting up files?
        let status = <ReplicationStatus>{
          pulled: info.last_seq,
          info: info
        }
        // TODO: Should we always resolve or if there is an errors property in the info doc should we reject?
        // If that is the case - we may need to make sure the sync-pull-last-seq is not set.
        resolve(status)
      }).on('error', (err) => {
        // console.log(err);
        this.errorMessage += `<p>${_TRANSLATE('Error exporting file: ')} ${fileName} ${_TRANSLATE(' at backup location: ')} ${backupLocation}  ${_TRANSLATE(' Error: ')} ${err}</p>`
        reject(err)
      });
      // })

      /* istanbul ignore next */
      function onErr(err) {
        // callback(err);
        console.log("Error: " + err)
      }
      // chain.catch(onErr);
    })
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

  downloadData(content, fileName, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = fileName;
    a.click();
  }
  
}



 



