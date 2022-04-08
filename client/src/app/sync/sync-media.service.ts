import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders} from "@angular/common/http";
import {DeviceService} from "../device/services/device.service";
import {AppConfigService} from "../shared/_services/app-config.service";
import {UserService} from "../shared/_services/user.service";
import {TangyFormsInfoService} from "../tangy-forms/tangy-forms-info-service";
import {CaseService} from "../case/services/case.service";
import {CaseDefinitionsService} from "../case/services/case-definitions.service";
import {TangyFormService} from "../tangy-forms/tangy-form.service";
import {VariableService} from "../shared/_services/variable.service";
import {Subject, Subscription, throwError} from "rxjs";
import {SyncDirection} from "./sync-direction.enum";
import {ReplicationStatus} from "./classes/replication-status.class";
import {UserDatabase} from "../shared/_classes/user-database.class";
import {_TRANSLATE} from "../shared/translation-marker";
import {catchError, finalize} from "rxjs/operators";
import * as SparkMD5 from 'spark-md5';
import {AppConfig} from "../shared/_classes/app-config.class";

declare const cordova: any;

@Injectable({
  providedIn: 'root'
})
export class SyncMediaService {

  constructor(
    private http: HttpClient,
    private deviceService: DeviceService,
    private appConfigService: AppConfigService,
    private userService: UserService,
    private tangyFormsInfoService: TangyFormsInfoService,
    private tangyFormService: TangyFormService,
    private variableService: VariableService
  ) {
    this.window = window;
  }

  window: any;
  syncMessage: any = {};
  public readonly syncMessage$: Subject<any> = new Subject();
  public readonly onCancelled$: Subject<any> = new Subject();
  replicationStatus: ReplicationStatus
  syncMediaServiceStartTime: string
  syncMediaServiceEndTime: string
  mediaFilesDir: string = 'Documents/Tangerine/media/'
  mediaFilesDirEntry: any
  uploadProgress: any = {};
  uploadSub: Subscription;
  statusMessage: string;
  private lastEntry: boolean;


  async sync(): Promise<any> {
    const appConfig = await this.appConfigService.getAppConfig()
    const device = await this.deviceService.getDevice()
    const userDb = new UserDatabase('shared', 'shared', device.key, device._id, true)

    this.syncMediaServiceStartTime = new Date().toISOString()
    // this.replicationStatus = new ReplicationStatus()

    const path = cordova.file.externalRootDirectory + this.mediaFilesDir
    this.mediaFilesDirEntry = await new Promise(resolve =>
      this.window.resolveLocalFileSystemURL(path, resolve)
    );
    const mediaDirEntries: any[] = await new Promise(resolve => {
      const reader = this.mediaFilesDirEntry.createReader();
      reader.readEntries((entries) => resolve(entries))
    });

    for (var i = 0; i < mediaDirEntries.length; i++) {
      this.lastEntry = (i + 1) === mediaDirEntries.length
      const entry = mediaDirEntries[i]
      const fileName = entry.name + '.webm'
      console.log("processing file: " + fileName)
      this.statusMessage = _TRANSLATE("Uploading file: ") + fileName + "; " + (i + 1) + _TRANSLATE(" of ") + mediaDirEntries.length + _TRANSLATE(" to upload")

      const dirEntry = await new Promise(resolve =>
        this.window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + this.mediaFilesDir, resolve)
      );
      const fileEntry = await new Promise(resolve => {
          (dirEntry as DirectoryEntry).getFile(entry.name, {create: true, exclusive: false}, resolve);
        }
      );
      const file: File = await new Promise(resolve => {
        (fileEntry as FileEntry).file(resolve)
      });

      const md5 = await this.computeChecksumMd5(file)
      console.log("md5: " + md5)

      let statusMessage
      try {
        statusMessage = await this.uploadFile(file, appConfig, md5)
        await new Promise(resolve => {
          (fileEntry as FileEntry).remove(resolve)
        });
      } catch (e) {
        this.statusMessage = _TRANSLATE("ERROR: Upload failed") + " : " + e.error
        console.log(e)
      }
      console.log("statusMessage: " + this.statusMessage)
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  async uploadFile(file: File, appConfig: AppConfig, md5: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let deleteFile = true
      let reader = this.getFileReader();
      reader.onloadend = async (e) => {
        // Create a blob based on the FileReader "result", which we asked to be retrieved as an ArrayBuffer
        const blob = new Blob([new Uint8Array(<ArrayBuffer>e.target.result)], {type: "video/webm"});
        const fileName = file.name + '.webm'
        const formData = new FormData();
        formData.append('video', blob, fileName);
        formData.append('md5', md5);
        // /app/:group/media-upload
        const url = `${appConfig.serverUrl}app/${appConfig.groupId}/client-media-upload`
        const upload$ = await this.http.post(url, formData, {
          headers: new HttpHeaders({
            'Authorization': appConfig.uploadToken
          }),
          reportProgress: true,
          observe: 'events'
        })
          .pipe(
            // catchError(this.handleError()), // then handle the error
            finalize(() => {
              if (deleteFile) {
                // this.deleteFile(file)
                console.log("deleting file: " + file.name)
                resolve(this.statusMessage)
              }
              this.reset()
            })
          );

        this.uploadSub = upload$.subscribe(event => {
          if (event.type == HttpEventType.UploadProgress) {
            const progress = Math.round(100 * (event.loaded / event.total));
            if (this.lastEntry && progress === 100) {
              this.statusMessage = _TRANSLATE("Upload complete")
            }
            this.uploadProgress = {
              progress: progress,
              message: this.statusMessage
            }
            this.syncMessage$.next(this.uploadProgress)
          }
        }, error => {
          deleteFile = false
          console.log('Error', error)
          this.statusMessage = _TRANSLATE("ERROR: Upload failed")
          this.uploadProgress = {
            progress: null,
            message: this.statusMessage
          }
          this.syncMessage$.next(this.uploadProgress)
          reject(error)
        }, () => {
          console.log('Completed')
          this.statusMessage = _TRANSLATE("Upload complete")
          resolve(this.statusMessage)
        });
      };
      // Read the file as an ArrayBuffer
      reader.readAsArrayBuffer(file);
    })
  }

  /**
   * Credit: https://dev.to/qortex/compute-md5-checksum-for-a-file-in-typescript-59a4
   * @param file
   */
  computeChecksumMd5(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunkSize = 2097152; // Read in chunks of 2MB
      const spark = new SparkMD5.ArrayBuffer();
      const fileReader = this.getFileReader();

      let cursor = 0; // current cursor in file

      fileReader.onerror = function (): void {
        reject('MD5 computation failed - error reading the file');
      };

      // read chunk starting at `cursor` into memory
      function processChunk(chunk_start: number): void {
        const chunk_end = Math.min(file.size, chunk_start + chunkSize);
        fileReader.readAsArrayBuffer(file.slice(chunk_start, chunk_end));
      }

      // when it's available in memory, process it
      // If using TS >= 3.6, you can use `FileReaderProgressEvent` type instead 
      // of `any` for `e` variable, otherwise stick with `any`
      // See https://github.com/Microsoft/TypeScript/issues/25510
      fileReader.onload = function (e: any): void {
        spark.append(e.target.result); // Accumulate chunk to md5 computation
        cursor += chunkSize; // Move past this chunk

        if (cursor < file.size) {
          // Enqueue next chunk to be accumulated
          processChunk(cursor);
        } else {
          // Computation ended, last chunk has been processed. Return as Promise value.
          // This returns the base64 encoded md5 hash, which is what
          // Rails ActiveStorage or cloud services expect
          // resolve(btoa(spark.end(true)));
          resolve(spark.end());

          // If you prefer the hexdigest form (looking like
          // '7cf530335b8547945f1a48880bc421b2'), replace the above line with:
          // resolve(spark.end());
        }
      };

      processChunk(0);
    });
  }

  getFileReader(): FileReader {
    const fileReader = new FileReader();
    const zoneOriginalInstance = (fileReader as any)["__zone_symbol__originalInstance"];
    return zoneOriginalInstance || fileReader;
  }

  cancelUpload() {
    this.uploadSub.unsubscribe();
    this.reset();
  }

  reset() {
    this.uploadProgress = null;
    this.uploadSub = null;
  }
}