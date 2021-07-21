import { Injectable, HttpService } from '@nestjs/common';
import { SyncSession } from '../../classes/sync-session.class';
import { TangerineConfigService } from '../../../../shared/services/tangerine-config/tangerine-config.service';
import {v4 as UUID} from 'uuid'
import { GroupService } from '../../../../shared/services/group/group.service';
import { ClientUserService } from '../../../../shared/services/client-user/client-user.service';
import { DbService } from '../../../../shared/services/db/db.service';
import { LocationConfig } from 'src/shared/classes/group-device.class';
import { GroupDeviceService } from 'src/shared/services/group-device/group-device.service';
const log = require('tangy-log').log

interface HttpError {
  ok: boolean 
  reason: string
}

export class SyncSessionInfo {
  syncSessionUrl:string
  deviceSyncLocations:Array<LocationConfig> 
}

@Injectable()
export class SyncSessionv2Service {

  constructor(
    private readonly http:HttpService,
    private readonly dbService:DbService,
    private readonly configService:TangerineConfigService,
    private readonly groupConfig:GroupService,
    private readonly groupDeviceService:GroupDeviceService,
    private readonly clientUserService:ClientUserService
  ) { }
  
  async start(groupId:string, deviceId:string):Promise<SyncSessionInfo> {
    try {
      // Create sync user
      const syncUsername = `syncUser-${UUID()}-${Date.now()}`
      const syncPassword = UUID()
      const config = await this.configService.config()
      const syncUserDoc = {
        "_id": `org.couchdb.user:${syncUsername}`,
        "name": syncUsername,
        "roles": [`sync-${groupId}`],
        "type": "user",
        "password": syncPassword 
      }
      await this.http.post(`${config.couchdbEndpoint}/_users`, syncUserDoc).toPromise()
      log.info(`Created sync session for user ${deviceId} in group ${groupId}`)
      const device = await this.groupDeviceService.read(groupId, deviceId)
      return <SyncSessionInfo>{
        syncSessionUrl: `${config.protocol}://${syncUsername}:${syncPassword}@${config.hostName}/db/${groupId}`,
        deviceSyncLocations: device.syncLocations
      }
    } catch(e) {
      throw e
    }
  }

  async expireSyncSessions() {
    // Expire all sync sessions after 24 hours. This means if a sync session takes longer than
    // 24 hours then it will be interrupted.
    const expireLimit = 24*60*60*1000
    const _usersDb = this.dbService.instantiate(`_users`)
    const expiredSyncSessions = (await _usersDb.allDocs({ include_docs: true }))
      .rows
      .map(row => row.doc)
      .filter(userDoc => userDoc._id.includes('org.couchdb.user:syncUser'))
      .filter(userDoc => (Date.now() - parseInt(userDoc.name.split('-')[6])) > expireLimit)
    for (const expiredSyncSession of expiredSyncSessions) {
      await _usersDb.remove(expiredSyncSession)
    }
  }

}
