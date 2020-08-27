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

  async sync(useSharedUser = false) {
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

    const replicationStatus: ReplicationStatus = await this.syncCouchdbService.sync(userDb, <SyncCouchdbDetails>{
      serverUrl: appConfig.serverUrl,
      groupId: appConfig.groupId,
      deviceId: device._id,
      deviceToken: device.token,
      deviceSyncLocations: device.syncLocations,
      formInfos
    })
    console.log('this.syncMessage: ' + JSON.stringify(this.syncMessage))

    await this.syncCustomService.sync(userDb, <SyncCustomDetails>{
      appConfig: appConfig,
      serverUrl: appConfig.serverUrl,
      groupId: appConfig.groupId,
      deviceId: device._id,
      deviceToken: device.token,
      formInfos
    })
    await this.deviceService.didSync()
  }



}
