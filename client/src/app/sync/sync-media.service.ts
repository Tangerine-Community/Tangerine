import {Injectable} from "@angular/core";
import {HttpClient, HttpEventType, HttpHeaders} from "@angular/common/http";
import {DeviceService} from "../device/services/device.service";
import {AppConfigService} from "../shared/_services/app-config.service";
import {UserService} from "../shared/_services/user.service";
import {TangyFormsInfoService} from "../tangy-forms/tangy-forms-info-service";
import {CaseService} from "../case/services/case.service";
import {CaseDefinitionsService} from "../case/services/case-definitions.service";
import {TangyFormService} from "../tangy-forms/tangy-form.service";
import {VariableService} from "../shared/_services/variable.service";
import {Subject, Subscription} from "rxjs";
import {SyncDirection} from "./sync-direction.enum";
import {ReplicationStatus} from "./classes/replication-status.class";
import {UserDatabase} from "../shared/_classes/user-database.class";
import {_TRANSLATE} from "../shared/translation-marker";
import {finalize} from "rxjs/operators";

declare const cordova: any;

@Injectable({
  providedIn: 'root'
})
export class SyncMediaService {

  constructor(
    private http: HttpClient,
    private deviceService:DeviceService,
    private appConfigService:AppConfigService,
    private userService:UserService,
    private tangyFormsInfoService:TangyFormsInfoService,
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
  syncMediaServiceStartTime:string
  syncMediaServiceEndTime:string
  mediaFilesDir: string = 'Documents/Tangerine/media/'
  mediaFilesDirEntry: any
  uploadProgress:number;
  uploadSub: Subscription;
  statusMessage: string;


  async sync():Promise<ReplicationStatus> {
    const appConfig = await this.appConfigService.getAppConfig()
    const device = await this.deviceService.getDevice()
    const userDb = new UserDatabase('shared', 'shared', device.key, device._id, true)
    
    this.syncMediaServiceStartTime = new Date().toISOString()
    this.replicationStatus = new ReplicationStatus()

    const path = cordova.file.externalRootDirectory + this.mediaFilesDir
    this.mediaFilesDirEntry = await new Promise(resolve =>
      this.window.resolveLocalFileSystemURL(path, resolve)
    );
    const mediaDirEntries: any[] = await new Promise(resolve => {
      const reader = this.mediaFilesDirEntry.createReader();
      reader.readEntries((entries) => resolve(entries))
    });

    for (var i = 0; i < mediaDirEntries.length; i++) {
      const entry = mediaDirEntries[i]
      const fileName = entry.name + '.webm'
      console.log("processing file: " + fileName)
      this.statusMessage += "<p>" + _TRANSLATE("Processing Directory: ") + entry.name + "</p>"
      let fileObj
      if (this.window.isCordovaApp) {
        fileObj = await new Promise(resolve => {
          entry.file(resolve);
        })
      } else {
        fileObj = entry
      }
      // const arrayBuffer = await new Promise((resolve, reject) => {
      //   const reader = new FileReader();
      //   reader.onloadend = (e) => {
      //     resolve(e.target.result)
      //   };
      //   reader.readAsArrayBuffer(fileObj)
      // })
      const arrayBuffer = await new Response(fileObj).arrayBuffer();
      // const file = new File([arrayBuffer], fileName, {
      //   type: 'video/webm;codecs=vp9,opus',
      // })

      // const arrayBuffer = await new Promise((resolve, reject) => {
      //   const reader = new FileReader();
      //   reader.onloadend = (e) => {
      //     resolve(e.target.result)
      //   };
      //   reader.readAsArrayBuffer(fileObj)
      // })

      const blob = new Blob([new Uint8Array(arrayBuffer)], { type: "video/webm;codecs=vp9,opus" });
      
      if (blob) {
        const formData = new FormData();
        formData.append('video', blob, fileName);
        // /app/:group/media-upload
        const url =  `${appConfig.serverUrl}app/${appConfig.groupId}/client-media-upload`
        const upload$ = this.http.post(url, formData, {
          headers: new HttpHeaders({
            'Authorization': appConfig.uploadToken
          }),
          reportProgress: true,
          observe: 'events'
        })
          .pipe(
            finalize(() => this.reset())
          );

        this.uploadSub = upload$.subscribe(event => {
          if (event.type == HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(100 * (event.loaded / event.total));
          }
        })
      }
    }
    return this.replicationStatus
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