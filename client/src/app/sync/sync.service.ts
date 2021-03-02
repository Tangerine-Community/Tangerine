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
import PouchDB from 'pouchdb'


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
  compareDocsStartTime: string
  compareLimit: number = 150
  batchSize: number = 200
  
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
      await this.addDeviceSyncMetadata();

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

  private async addDeviceSyncMetadata() {
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
  }

  async calculateLocalDocsForLocation(appConfig: AppConfig, userDb: UserDatabase, formInfos: Array<FormInfo>) {
    
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
  
  async compareDocs():Promise<ReplicationStatus> {
    
    let status = <ReplicationStatus>{
      pulled: 0,
      pullConflicts: [],
      info: '',
      remaining: 0,
      direction: ''
    }
    
    const appConfig = await this.appConfigService.getAppConfig()
    if (appConfig.batchSize) {
      this.batchSize = appConfig.batchSize
      console.log("this.batchSize: " + this.batchSize)
    }
    if (appConfig.compareLimit) {
      this.compareLimit = appConfig.compareLimit
      console.log("this.compareLimit: " + this.compareLimit)
    }
    const device = await this.deviceService.getDevice()
    let userDb: UserDatabase = await this.userService.getUserDatabase()

    this.compareDocsStartTime = new Date().toISOString()

    const syncDetails: SyncCouchdbDetails = <SyncCouchdbDetails>{
      serverUrl: appConfig.serverUrl,
      groupId: appConfig.groupId,
      deviceId: device._id,
      deviceToken: device.token,
      deviceSyncLocations: device.syncLocations
    }

    const syncSessionUrl = await this.http.get(`${syncDetails.serverUrl}sync-session/start/${syncDetails.groupId}/${syncDetails.deviceId}/${syncDetails.deviceToken}`, {responseType: 'text'}).toPromise()
    const remoteDb = new PouchDB(syncSessionUrl)
    const options = {limit: this.compareLimit}
    const localDocs = await this.pageThroughAlldocs(userDb.db, options, "local device");
    const remoteDocs = await this.pageThroughAlldocs(remoteDb, options, "server");
    console.log("localDocs: " + localDocs.length + " remoteDocs: " + remoteDocs.length)
    this.syncMessage$.next({
      message: window['t']("Now calculating documents to sync to the server. Docs in local tablet: " + localDocs.length + " Docs on server: " + remoteDocs.length)
    })
    let i=0, idsToSync = []
    localDocs.forEach(localDoc => {
      // if we really wanted to, we could also check localDoc.value.rev
      if (!remoteDocs.some(e => e.id === localDoc.id)) {
        // TODO: Do we need to exclude the profile doc?
        if (!localDoc.id.includes('_design')) {
          idsToSync.push(localDoc.id)
        }
      }
      i++
      if (i % 50 == 0) {
        this.syncMessage$.next({
          message: window['t']("Compared " + i + " local docs out of: " + localDocs.length)
        })
      }
    })
    if (idsToSync.length > 0) {
      this.syncMessage$.next({
        message: window['t']("There are  " + idsToSync.length + " docs to sync. ")
      })

      let pushed = 0
      let syncOptions = {
        "batch_size": this.batchSize,
        "batches_limit": 1,
        "remaining": 100,
        "pushed": pushed,
        "doc_ids": idsToSync
      }

      try {
        status = <ReplicationStatus>await this.syncCouchdbService.pushSyncBatch(userDb, remoteDb, syncOptions);
        if (typeof status.pushed !== 'undefined') {
          pushed = pushed + status.pushed
          status.pushed = pushed
        } else {
          status.pushed = pushed
        }
        this.syncMessage$.next(status)
      } catch (e) {
        console.log("Error: " + e)
      }
    } else {
      status.pushed = 0
      this.syncMessage$.next({
        message: window['t']("There are no docs to sync. ")
      })
    }

    this.replicationStatus = status
    
    try {
      this.replicationStatus.compareDocsStartTime = this.compareDocsStartTime
      if (appConfig.calculateLocalDocsForLocation) {
        const formInfos = await this.tangyFormsInfoService.getFormsInfo()
        let formStats = await this.calculateLocalDocsForLocation(appConfig, userDb, formInfos);
        this.replicationStatus.localDocsForLocation = formStats
      }
      this.replicationStatus.compareDocsEndTime = new Date().toISOString()
      const start = moment(this.replicationStatus.compareDocsStartTime)
      const end = moment(this.replicationStatus.compareDocsEndTime)
      const diff = end.diff(start)
      const duration = moment.duration(diff).as('milliseconds')
      this.replicationStatus.localDocsCount = localDocs.length
      this.replicationStatus.remoteDocsCount = remoteDocs.length
      this.replicationStatus.idsToSyncCount = idsToSync.length
      this.replicationStatus.compareSyncDuration = duration
      await this.addDeviceSyncMetadata()
      
      this.syncMessage$.next({
        message: window['t']('Sending sync status to server. Please wait...')
      })
      await this.deviceService.didSync(status)
    } catch (e) {
      this.syncMessage$.next({message: window['t']('Error sending sync status to server: ' + e)})
      console.log("Error: " + e)
    }
    
    return status
  }

  async pageThroughAlldocs(database: PouchDB, options, dbName) {
    let allDocs = []
    let remaining = true
    let total_rows = 0
    // Reset startkey if it was set in previous function call.
    delete options.startkey
    while (remaining === true) {
      try {
        await database.allDocs(options, (err, response) => {
          if (err) {
            console.log("Error getting allDocs: " + err)
          }
          total_rows = response.total_rows
          if (response && response.rows.length > 0) {
            const startkey = response.rows[response.rows.length - 1].id
            // Remove the last item (to be used as startkey) and add to the allDocs array
            allDocs.push(...response.rows.splice(0, response.rows.length-1))
            if (response.rows.length === 1 && startkey === options.startkey) {
              allDocs.push(response.rows[0])
              remaining = false
            } else {
              options.startkey = startkey
            }
            const message = 'Collected ' + allDocs.length + ' out of ' + total_rows + ' docs from the ' + dbName + ' for comparison.';
            this.syncMessage$.next({
              message: window['t'](message)
            })
          } else {
            remaining = false
          }
        })
      } catch (e) {
        console.log("Error getting allDocs: " + e)
      }
    }
    console.log("total_rows: " + total_rows)
    return allDocs;
  }
  
}
