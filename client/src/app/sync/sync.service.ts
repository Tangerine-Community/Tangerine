import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { DeviceService } from './../device/services/device.service';
import { SyncCustomService, SyncCustomDetails } from './sync-custom.service';
import { SyncCouchdbService, SyncCouchdbDetails } from './sync-couchdb.service';
import { UserDatabase } from 'src/app/shared/_classes/user-database.class';
import { UserService } from 'src/app/shared/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplicationStatus } from './classes/replication-status.class';
import {Subject} from 'rxjs';
import {CaseService} from "../case/services/case.service";
import {CaseDefinitionsService} from "../case/services/case-definitions.service";
import {TangyFormService} from "../tangy-forms/tangy-form.service";

export const SYNC_MODE_CUSTOM = 'SYNC_MODE_CUSTOM'
export const SYNC_MODE_COUCHDB = 'SYNC_MODE_COUCHDB'
export const SYNC_MODE_ALL = 'SYNC_MODE_ALL'

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  constructor(
    private http: HttpClient,
    private syncCouchdbService:SyncCouchdbService,
    private syncCustomService:SyncCustomService,
    private deviceService:DeviceService,
    private appConfigService:AppConfigService,
    private userService:UserService,
    private tangyFormsInfoService:TangyFormsInfoService,
    private caseService: CaseService,
    private caseDefinitionsService: CaseDefinitionsService,
    private tangyFormService: TangyFormService
  ) { }

  syncMessage: any = {};
  public readonly syncMessage$: Subject<any> = new Subject();
  replicationStatus: ReplicationStatus

  // @TODO RJ: useSharedUser parameter may be cruft. Remove it? Is it used for testing? It is used in the first sync but probably not necessary.
  async sync(useSharedUser = false, isFirstSync = false) {
    const appConfig = await this.appConfigService.getAppConfig()
    const device = await this.deviceService.getDevice()
    const formInfos = await this.tangyFormsInfoService.getFormsInfo()
    let userDb:UserDatabase
    if (useSharedUser) {
      const device = await this.deviceService.getDevice()
      userDb = new UserDatabase('shared', 'shared', device.key, device._id, true)
    } else {
      userDb = await this.userService.getUserDatabase()
    }

    this.syncCouchdbService.syncMessage$.subscribe({
      next: (progress) => {
        // this.syncMessage =  message.docs_written + ' docs saved.'
        this.syncMessage$.next(progress)
        // console.log('Sync svc: ' + JSON.stringify(message))
      }
    })

    //
    // @TODO RJ: I'm adding the isFirstSync param, but found caseDefinition parameter is left to null.
    //       Is this causing issues in this.conflictService.resolveConflicts?
    //
    this.replicationStatus = await this.syncCouchdbService.sync(
      userDb,
      <SyncCouchdbDetails>{
        serverUrl: appConfig.serverUrl,
        groupId: appConfig.groupId,
        deviceId: device._id,
        deviceToken: device.token,
        deviceSyncLocations: device.syncLocations,
        formInfos
      },
      null,
      isFirstSync
    )
    console.log('Finished syncCouchdbService sync: ' + JSON.stringify(this.syncMessage))

    await this.syncCustomService.sync(userDb, <SyncCustomDetails>{
      appConfig: appConfig,
      serverUrl: appConfig.serverUrl,
      groupId: appConfig.groupId,
      deviceId: device._id,
      deviceToken: device.token,
      formInfos
    })

    this.syncMessage$.next({ 
      message: window['t']('Sync is complete, sending status to server. Please wait...'),
    })

    try {
      const tangerineVersion = await this.deviceService.getTangerineVersion()
      this.replicationStatus.tangerineVersion = tangerineVersion
      await this.deviceService.didSync(this.replicationStatus)
    } catch (e) {
      this.syncMessage$.next({message: window['t']('Error sending sync status to server: ' + e)})
      console.log("Error: " + e)
    }
    
    if (
      isFirstSync ||
      (!isFirstSync && !appConfig.indexViewsOnlyOnFirstSync)
    ) {
      this.syncMessage$.next({ message: window['t']('Optimizing data. This may take several minutes. Please wait...') })
      await this.indexViews()
    }
    return this.replicationStatus
  }

  // Sync Protocol 2 view indexer. This excludes views for SP1 and includes custom views from content developers.
  async indexViews() {
    const exclude = [
      'tangy-form/responsesLockedAndNotUploaded',
      'tangy-form/responsesUnLockedAndNotUploaded',
      'tangy-form/responsesLockedAndUploaded',
      'tangy-form/responsesUnLockedAndUploaded',
      'tangy-form/responseByUploadDatetime',
      'responsesUnLockedAndNotUploaded'
    ]
    const db = await this.userService.getUserDatabase()
    const result = await db.allDocs({start_key: "_design/", end_key: "_design0", include_docs: true}) 
    console.log(`Indexing ${result.rows.length} views.`)
    let i = 0
    for (let row of result.rows) {
      if (row.doc.views) {
        for (let viewId in row.doc.views) {
          const viewPath = `${row.doc._id.replace('_design/', '')}/${viewId}`
          if (!exclude.includes(viewPath)) {
            console.log(`Indexing: ${viewPath}`)
            await db.query(viewPath, { limit: 1 })
          }
        }
      }
      this.syncMessage$.next({ message: `${window['t']('Optimizing data. Please wait...')} ${Math.round((i/result.rows.length)*100)}%` })
      i++
    }
   

  }



}
