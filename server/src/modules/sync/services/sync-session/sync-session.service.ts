import { Injectable, HttpService } from '@nestjs/common';
import { SyncSession } from '../../classes/sync-session.class';
import { TangerineConfigService } from '../../../../shared/services/tangerine-config/tangerine-config.service';
import * as UUID from 'uuid/v4'
import { GroupService } from '../../../../shared/services/group/group.service';
import { ClientUserService } from '../../../../shared/services/client-user/client-user.service';
import { DbService } from '../../../../shared/services/db/db.service';
const log = require('tangy-log').log

interface HttpError {
  ok: boolean 
  reason: string
}

@Injectable()
export class SyncSessionService {

  constructor(
    private readonly http:HttpService,
    private readonly dbService:DbService,
    private readonly configService:TangerineConfigService,
    private readonly groupConfig:GroupService,
    private readonly clientUserService:ClientUserService
  ) { }
  
  async start(groupId:string, profileId:string):Promise<SyncSession> {
    try {
      const groupDb = this.dbService.instantiate(groupId)
      const clientUser = await groupDb.get(profileId) 
      // Create sync user
      const syncUsername = `syncUser-${UUID()}`
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
      const formIds = (await this.groupConfig.read(groupId)).config.sync.formIds
      log.info(`Created sync session for user ${profileId} in group ${groupId}`)
      return <SyncSession>{
        pouchDbSyncUrl: `${config.protocol}://${syncUsername}:${syncPassword}@${config.hostName}/db/${groupId}`,
        pouchDbSyncOptions: {
          selector: {
            "$or": [
              ...formIds.map(formId => {
                return { "form.id": formId }
              }),
              {
                "_id": profileId
              }
            ]
          }
        },
        formIdsToNotPush: formIds
      }
    } catch(e) {
      throw e
    }
  }

}
