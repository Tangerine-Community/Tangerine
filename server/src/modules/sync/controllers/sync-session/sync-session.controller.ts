import { GroupDeviceService } from './../../../../shared/services/group-device/group-device.service';
import { Controller, Get, Param, Post } from '@nestjs/common';
import { SyncSessionService } from '../../services/sync-session/sync-session.service';
const log = require('tangy-log').log

@Controller('sync-session')
export class SyncSessionController {

  constructor(
    private readonly syncSessionService:SyncSessionService,
    private readonly groupDeviceService:GroupDeviceService
  ) { }

  
  @Get ('start/:groupId/:deviceId/:deviceToken')
  async start(@Param('groupId') groupId:string, @Param('deviceId') deviceId:string, @Param('deviceToken') deviceToken:string):Promise<string> {
    try {
      if (await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, deviceToken)) {
        return await this.syncSessionService.start(groupId, deviceId)
      } else {
        console.log(`Permission Denied: Device ${deviceId} used incorrect token to start sync session.`)
      }
    } catch (err) {
      log.error(`Error in sync-session/start with groupId: ${groupId} deviceId: ${deviceId} deviceToken: ${deviceToken} `)
      console.log(err)
    }
  }

}

