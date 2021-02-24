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
import {VariableService} from "../shared/_services/variable.service";
import * as moment from 'moment'
import {AppConfig} from "../shared/_classes/app-config.class";
import {FormInfo} from "../tangy-forms/classes/form-info.class";
import {createSearchIndex} from "../shared/_services/create-search-index";
import { createSyncFormIndex } from './create-sync-form-index';

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
    private tangyFormService: TangyFormService,
    private variableService: VariableService
  ) { }

  syncMessage: any = {};
  public readonly syncMessage$: Subject<any> = new Subject();
  replicationStatus: ReplicationStatus
  findSelectorLimit = 200
  syncCouchdbServiceStartTime:string
  syncCouchdbServiceEndime:string

  // @TODO RJ: useSharedUser parameter may be cruft. Remove it? Is it used for testing? It is used in the first sync but probably not necessary.
  async sync(useSharedUser = false, isFirstSync = false, fullSync:string):Promise<ReplicationStatus> {
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

    this.syncCouchdbServiceStartTime = new Date().toISOString()

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
      isFirstSync,
      fullSync
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

    this.syncCouchdbServiceEndime = new Date().toISOString()

    if (appConfig.calculateLocalDocsForLocation) {
      let formStats = await this.calculateLocalDocsForLocation(appConfig, userDb, formInfos);
      this.replicationStatus.localDocsForLocation = formStats
    }
    const start = moment(this.syncCouchdbServiceStartTime)
    const end = moment(this.syncCouchdbServiceEndime)
    const diff = end.diff(start)
    const duration = moment.duration(diff).as('milliseconds')
    // const durationUTC = moment.utc(duration).format('HH:mm:ss')

    try {
      // reset pullConflicts - we don't want to send these stats.
      this.replicationStatus.pullConflicts = []
      this.replicationStatus.syncCouchdbServiceStartTime = this.syncCouchdbServiceStartTime
      this.replicationStatus.syncCouchdbServiceEndime = this.syncCouchdbServiceEndime
      this.replicationStatus.syncCouchdbServiceDuration = duration
      const deviceInfo = await this.deviceService.getAppInfo()
      this.replicationStatus.deviceInfo = deviceInfo
      const userDb = await this.userService.getUserDatabase()
      const dbDocCount = (await userDb.db.info()).doc_count
      this.replicationStatus.dbDocCount = dbDocCount
      const connection = navigator['connection']
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink;
      const downlinkMax = connection.downlinkMax;
      this.replicationStatus.effectiveConnectionType = effectiveType
      this.replicationStatus.networkDownlinkSpeed = downlink
      this.replicationStatus.networkDownlinkMax = downlinkMax
      const userAgent = navigator['userAgent']
      this.replicationStatus.userAgent = userAgent

      this.syncMessage$.next({
        message: window['t']('Sending sync status to server. Please wait...')
      })
      
      await this.deviceService.didSync(this.replicationStatus)
    } catch (e) {
      this.syncMessage$.next({message: window['t']('Error sending sync status to server: ' + e)})
      console.log("Error: " + e)
    }
    
    if (
      isFirstSync ||
      (!isFirstSync && !appConfig.indexViewsOnlyOnFirstSync)
    ) {
      this.syncMessage$.next({ 
        message: window['t']('Optimizing data. This may take several minutes. Please wait...'),
        remaining: null
      })
      await this.indexViews()
    }
    return this.replicationStatus
  }

  private async calculateLocalDocsForLocation(appConfig: AppConfig, userDb: UserDatabase, formInfos: Array<FormInfo>) {
    
    this.syncMessage$.next({
      message: window['t']('Sync is complete; calculating sync statistics. Please wait...')
    })
    
    let formStats

      try {
        if (!await this.variableService.get('first-index-for-sync-formids')) {
          this.syncMessage$.next({
            message: window['t']('Need to build an index for the form id count. Please wait...')
          })
        }
        if (!await this.variableService.get('ran-update-v3.16.3')) {
          console.log('Adding _design/sync-formids view')
          await this.createSyncFormIndex()
          await this.variableService.set('ran-update-v3.16.3', 'true')
        }
        
        const r = await userDb.query('sync-formids')
        if (!await this.variableService.get('first-index-for-sync-formids')) {
          await this.variableService.set('first-index-for-sync-formids', 'true')
          this.syncMessage$.next({
            message: window['t']('Built an index for the form id count. Thanks for waiting!')
          })
        }
        console.log("r: " + JSON.stringify(r))
        const count = r.rows.length
        formStats = count
      } catch (e) {
        console.log("Error getting formStats: " + e)
      }
    return formStats;
  }

// Sync Protocol 2 view indexer. This excludes views for SP1 and includes custom views from content developers.
  async indexViews() {
    const exclude = [
      'tangy-form/responsesLockedAndNotUploaded',
      'tangy-form/responsesUnLockedAndNotUploaded',
      'tangy-form/responsesLockedAndUploaded',
      'tangy-form/responsesUnLockedAndUploaded',
      'tangy-form/responseByUploadDatetime',
      'responsesUnLockedAndNotUploaded',
      'find-docs-by-form-id-pageable/find-docs-by-form-id-pageable'
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

  async createSyncFormIndex(username:string = '') {
    let db
    if (!username) {
      db = await this.userService.getUserDatabase()
    } else {
      db = await this.userService.getUserDatabase(username)
    }
    // const formsInfo = await this.formsInfoService.getFormsInfo()
    const formsInfo = await this.tangyFormsInfoService.getFormsInfo()
    await createSyncFormIndex(db, formsInfo)
  }
  
}
