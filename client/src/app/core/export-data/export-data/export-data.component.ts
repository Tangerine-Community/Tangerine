import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../../shared/_services/user.service';
import {SyncingService} from '../../sync-records/_services/syncing.service';
import {_TRANSLATE} from '../../../shared/translation-marker';
import {AppConfigService} from '../../../shared/_services/app-config.service';
import {DB} from '../../../shared/_factories/db.factory'
import {AppConfig} from "../../../shared/_classes/app-config.class";

const SHARED_USER_DATABASE_NAME = 'shared-user-database';
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

  window: any;
  statusMessage: string
  progressMessage: string
  errorMessage: string
  backupDir: string = 'Documents/Tangerine/backups/'
  SPLIT = 200
  rootDirEntry
  destDirEntry
  dirHandle
  fileHandle
  shouldShow
  private appConfig: AppConfig;
  splitFilesValue: any;
  
  @ViewChild('splitFiles', {static: false}) splitFiles: ElementRef
  @ViewChild('container', {static: false}) container: ElementRef;

  constructor(
    private userService: UserService,
    private syncingService: SyncingService,
    private appConfigService: AppConfigService
  ) {
    this.window = window;
  }

  async ngOnInit() {
    this.statusMessage = ''
    this.progressMessage = ''
    this.errorMessage = ''
    this.appConfig = await this.appConfigService.getAppConfig()


    if (this.window.isCordovaApp) {
      this.backupDir = 'Documents/Tangerine/backups/'
    } else {
      this.backupDir = `${_TRANSLATE('Click button to start download to desired directory.')} `
    }

    if (this.window.isCordovaApp) {
      this.window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + 'Documents', (directoryEntry) => {
        directoryEntry.getDirectory('Tangerine', {create: true}, (dirEntry) => {
          dirEntry.getDirectory('backups', {create: true}, (subDirEntry) => {
          }, this.onErrorGetDir);
          dirEntry.getDirectory('restore', {create: true}, (subDirEntry) => {
          }, this.onErrorGetDir);
        }, this.onErrorGetDir);
      })
    }

    if (this.window.isCordovaApp && window['turnOffAppLevelEncryption']) {
      this.shouldShow = true
    } else {
      this.shouldShow = false
    }
  }

  async ngAfterViewInit() {
    if (this.window.isCordovaApp && window['turnOffAppLevelEncryption']) {
      await this.calculateSplit()
      // this.splitFiles.nativeElement.value = String(this.SPLIT)
      this.splitFilesValue = String(this.SPLIT)
    }
  }

  async exportAllRecords() {
    this.statusMessage = ''
    this.progressMessage = ''
    this.errorMessage = ''
    const dbNames = [SHARED_USER_DATABASE_NAME, USERS_DATABASE_NAME, LOCKBOX_DATABASE_NAME, VARIABLES_DATABASE_NAME]
    // APK's that use in-app encryption
    if (window['isCordovaApp'] && this.appConfig.syncProtocol === '2' && !window['turnOffAppLevelEncryption']) {

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
      if (this.window.isCordovaApp) {
        if (this.splitFiles.nativeElement.value && this.splitFiles.nativeElement.value.length > 0) {
          this.SPLIT = Number(this.splitFiles.nativeElement.value)
        }
        const backupLocation = cordova.file.externalRootDirectory + this.backupDir;
        this.rootDirEntry = await new Promise(resolve =>
          this.window.resolveLocalFileSystemURL(backupLocation, resolve)
        );
      }

      for (let index = 0; index < dbNames.length; index++) {
        const dbName = dbNames[index]
        // copy the database
        console.log(`exporting ${dbName} db over to the user accessible fs`)
        const db = DB(dbName)
        const now = new Date();
        const fileName =
          `${dbName}_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.json`;
        if (this.window.isCordovaApp) {
          const backupLocation = cordova.file.externalRootDirectory + this.backupDir;

          function onErrorDir(e) {
            console.log("Error: " + e)
            let errorMessage
            if (e && e.code && e.code === 1) {
              errorMessage = "File or directory not found."
            } else {
              errorMessage = e
            }
            this.errorMessage += `<p>${_TRANSLATE('Error with dir: ')} ${dbName} ${_TRANSLATE(' at backup location: ')} ${backupLocation}  ${_TRANSLATE(' Error: ')} ${errorMessage}</p>`
          }

          // first delete dir
          this.progressMessage = `<p>${_TRANSLATE('Deleting old backup directory at ')} ${backupLocation}${dbName} </p>`


          const deletedDirectoryMessage = await new Promise((resolve, reject) => {
              const deletedDir =  this.rootDirEntry.getDirectory(dbName, {create: true}, (subDirEntry) => {
                subDirEntry.removeRecursively(function () {
                  const message = `${_TRANSLATE('Deleted old data directory at ')} ${backupLocation}${dbName}`
                  // console.log(message);
                  resolve(message)
                }, onErrorDir)
              }, reject)
              return deletedDir
            }
          );
          console.log(deletedDirectoryMessage)

          // Now create the dir
          this.destDirEntry = await new Promise((resolve, reject) => {
              console.log(`Created directory at ${backupLocation}${dbName}`)
              this.progressMessage = `<p>${_TRANSLATE('Created directory at ')} ${backupLocation}${dbName} </p>`
              return this.rootDirEntry.getDirectory(dbName, {create: true}, resolve, reject)
            }
          );

          let dumpOpts = {
            batch_size: 100 // decent default for good performance
          };

          const splitBatches = Math.max(1, Math.floor(this.SPLIT / 10))
          console.log("batch_size: " + splitBatches)
          dumpOpts.batch_size = splitBatches

          let numFiles = 0;
          let numDocsInBatch = 0;
          let out = [];
          let header;
          let first = true;

          const splitPromises = [];

          function createSplitFileName() {
            let numStr = numFiles.toString();
            while (numStr.length < 8) {
              numStr = '0' + numStr;
            }
            // if the filename is e.g. foo.txt, return
            // foo_00000000.txt
            // else just foo_00000000
            const match = fileName.match(/\.[^\.]+$/);
            if (match) {
              return fileName.replace(/\.[^\.]+$/, '_' + numStr + match[0]);
            } else {
              return fileName + '_' + numStr;
            }
          }

          async function dumpToSplitFile(that) {
              const suggestedName = createSplitFileName()
              that.destDirEntry.getFile(suggestedName, {create: true}, (fileEntry) => {
                fileEntry.createWriter((fileWriter) => {
                  fileWriter.onwriteend = (data) => {
                    console.log(`Backup stored at ${dbName}/${suggestedName}`)
                    that.progressMessage = `<p>${_TRANSLATE('Backup stored at ')} ${backupLocation}${dbName}/${suggestedName} </p>`
                  };
                  fileWriter.onerror = (e) => {
                    alert(`${_TRANSLATE('Write Failed')}` + e.toString());
                    that.errorMessage += `<p>${_TRANSLATE('Write Failed')}` + e.toString() + "</p>"
                  };
                  const stringOutput = header + out.join("")
                  fileWriter.write(stringOutput);
                  //resetting out array
                  out = [];
                  numDocsInBatch = 0;
                  numFiles++;
                });
              });
          }

          const stream = new window['Memorystream']
          stream.on('data', async (chunk) => {
            // data += chunk.toString();
            var line = JSON.parse(chunk);
            if (first) {
              header = chunk;
              // console.log();
              let doc_del_count = line.db_info.doc_del_count ? line.db_info.doc_del_count : 0
              var totalDocs = line.db_info.doc_count + doc_del_count;
              this.statusMessage += `<p>${_TRANSLATE('Backing up ')} ${totalDocs} ${_TRANSLATE(' docs for ')} ${dbName}</p>`

            } else if (line.seq) {
              // console.log("line")
            }

            if (line.docs) {
              numDocsInBatch += line.docs.length;
              if (numDocsInBatch >= this.SPLIT) {
                await dumpToSplitFile(this);
              }
            }
            if (!first) {
              out.push(chunk);
            }
            first = false;
            // next();
          });

          async function processData() {
            if (out.length) {
              await dumpToSplitFile(this);
            }
            Promise.all(splitPromises).then(() => {
              console.log(`Finished processing ${dbName}`); // clear the progress bar
            });
          }

          await db.dump(stream, dumpOpts).then(processData.bind(this));
          this.progressMessage = ""
          this.statusMessage += `<p>${_TRANSLATE('Backup completed at')} ${backupLocation}${dbName}</p>`

        } else {

          const stream = new window['Memorystream']
          let data = '';
          stream.on('data', function (chunk) {
            data += chunk.toString();
          });
          await db.dump(stream)
          console.log('Successfully exported : ' + dbName);
          this.statusMessage += `<p>${_TRANSLATE('Successfully exported database ')} ${dbName}</p>`
          const file = new Blob([data], {type: 'application/json'});
          this.downloadData(file, fileName, 'application/json');
        }
      }
    }
  }

  private async calculateSplit() {
    const appConfig = await this.appConfigService.getAppConfig()
    const defaultSPLIT = this.SPLIT
    this.SPLIT = appConfig.dbBackupSplitNumberFiles ? appConfig.dbBackupSplitNumberFiles : defaultSPLIT
    return this.SPLIT;
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



 



