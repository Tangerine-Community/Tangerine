import {Controller, Get, Param} from '@nestjs/common';
import {SyncSessionService} from "../../services/sync-session/sync-session.service";
import {GroupDeviceService} from "../../../../shared/services/group-device/group-device.service";
import {BulkSyncService} from "../../services/bulk-sync/bulk-sync.service";
import {AxiosResponse} from "axios";
const log = require('tangy-log').log

@Controller('bulk-sync')
export class BulkSyncController {

  constructor(
    private readonly syncSessionService:SyncSessionService,
    private readonly groupDeviceService:GroupDeviceService,
    private readonly bulkSyncService:BulkSyncService
  ) { }

  @Get ('start/:groupId/:deviceId/:deviceToken')
  async start(@Param('groupId') groupId:string, @Param('deviceId') deviceId:string, @Param('deviceToken') deviceToken:string):Promise<AxiosResponse<any>> {
    try {
      if (await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, deviceToken)) {
        const tokenUrl = await this.syncSessionService.start(groupId, deviceId)
        const params = tokenUrl.split('/')
        // return `${config.protocol}://${syncUsername}:${syncPassword}@${config.hostName}/db/${groupId}`
        const baseUrl = params[2]
        const baseUrlParams = baseUrl.split('a')
        const syncCredentials = baseUrlParams[0]
        const syncUsername = syncCredentials[0]
        const syncPassword = syncCredentials[1]
        return await this.bulkSyncService.dump(groupId, deviceId, syncUsername, syncPassword)
      } else {
        console.log(`Permission Denied: Device ${deviceId} used incorrect token to start sync session.`)
      }
    } catch (err) {
      log.error(`Error in sync-session/start with groupId: ${groupId} deviceId: ${deviceId} deviceToken: ${deviceToken} `)
      console.log(err)
    }
  }
}
