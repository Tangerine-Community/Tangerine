import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { DeviceService } from './../device/services/device.service';
import { SyncCustomService, SyncCustomDetails } from './sync-custom.service';
import { SyncCouchdbService, SyncCouchdbDetails } from './sync-couchdb.service';
import PouchDB from 'pouchdb';
import { AppConfig } from './../shared/_classes/app-config.class';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { UserDatabase } from 'src/app/shared/_classes/user-database.class';
import { UserService } from 'src/app/shared/_services/user.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplicationStatus } from './classes/replication-status.class';
import * as pako from 'pako';

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
    private tangyFormsInfoService:TangyFormsInfoService
  ) { }

  async sync(useSharedUser = false) {
    const appConfig = await this.appConfigService.getAppConfig()
    const device = await this.deviceService.getDevice()
    const formInfos = await this.tangyFormsInfoService.getFormsInfo()
    let userDb:UserDatabase
    if (useSharedUser) {
      const device = await this.deviceService.getDevice()
      userDb = new UserDatabase('shared', 'shared', device._id, true)
    } else { 
      userDb = await this.userService.getUserDatabase()
    }
    await this.syncCouchdbService.sync(userDb, <SyncCouchdbDetails>{
      serverUrl: appConfig.serverUrl,
      groupId: appConfig.groupId,
      deviceId: device._id,
      deviceToken: device.token,
      deviceSyncLocations: device.syncLocations,
      formInfos
    })
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
