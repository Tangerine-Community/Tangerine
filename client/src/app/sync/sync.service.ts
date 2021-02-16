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

  // @TODO RJ: useSharedUser parameter may be cruft. Remove it? Is it used for testing? It is used in the first sync but probably not necessary.
  async sync(useSharedUser = false, isFirstSync = false, fullSync = false):Promise<ReplicationStatus> {
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
    
    if (appConfig.calculateLocalDocsForLocation) {

      if (appConfig.findSelectorLimit) {
        this.findSelectorLimit = appConfig.findSelectorLimit
        console.log("this.findSelectorLimit: " + this.findSelectorLimit)
      }
      
      // Setup Mango query for paging through almost all Docs.
      if (! await this.variableService.get('inserted-find-docs-by-form-id-pageable-view')) {
        this.syncMessage$.next({
          message: window['t']('Creating index for location sync stats. Please wait...')
        })
        await this.createSyncIndexes(userDb)
        this.syncMessage$.next({
          message: window['t']('Done! Completed indexing for location sync stats. Please wait...')
        })
        await this.variableService.set('inserted-find-docs-by-form-id-pageable-view', 'true')
      }

    this.syncMessage$.next({ 
      message: window['t']('Sync is complete; calculating sync statistics. Please wait...')
    })

    function makeFindSelector(lastModified) {

      return {
        "lastModified": {"$gt": lastModified},
        // "form.id": {"$in": ["user-profile", "case-type-1-manifest", "registration-role-1"]}
        "form.id": {
          "$in": [
            ...formInfos.reduce(($or, formInfo) => {
              if (formInfo.couchdbSyncSettings && formInfo.couchdbSyncSettings.enabled && formInfo.couchdbSyncSettings.pull) {
                $or = [
                  ...$or,
                  ...[
                    formInfo.id
                  ]
                ]
              }
              return $or
            }, [])
          ]
        }
      }
    }

    let findSelector = makeFindSelector(0)
    let options = {
      selector:findSelector,
      sort: ['lastModified'],
      limit : this.findSelectorLimit
    }
    let localDocsForLocation = 0
    let remaining = true
    while(remaining === true) {
      try {
        await userDb.db.find(options, function (err, response) {
          if (err) {
            console.log("Error getting localDocsForLocation: " + err)
          }
          if (response && response.docs.length > 0) {
            const lastModified = response.docs[response.docs.length - 1].lastModified;
            // options["startkey"] = lastModified
            findSelector = makeFindSelector(lastModified)
            options = {
              selector: findSelector,
              sort: ['lastModified'],
              limit: 50
            }
            options["skip"] = 1;
            localDocsForLocation = localDocsForLocation + response.docs.length
          } else {
            remaining = false
          }
        })
      } catch (e) {
        console.log("Error getting localDocsForLocation: " + e)
      }
    }
    
    this.replicationStatus.localDocsForLocation = localDocsForLocation
      
    }
    try {
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

  async createSyncIndexes(userDb) {
    console.log('Creating index for field of form.id and lastModified that is pageable')
    await userDb.db.createIndex({
      index: {
        fields: [
          'lastModified',
          'form.id'
        ],
        ddoc: 'find-docs-by-form-id-pageable',
        name: 'find-docs-by-form-id-pageable'
      }
    })
    console.log("Created index for find-docs-by-form-id-pageable")
    try {
      const result = await userDb.db.find({
        selector: {
          type: '',
          "lastModified": {"$gt": 0},
          "form.id": {"$in": ["user-profile"]}
        },
        use_index: 'find-docs-by-form-id-pageable',
        limit: 0
      })
      console.log("Completed indexing")
    } catch (e) {
      console.log("Error: " + e)
    }
  }
}
