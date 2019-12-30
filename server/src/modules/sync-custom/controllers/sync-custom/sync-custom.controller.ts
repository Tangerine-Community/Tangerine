import { SyncCustomService } from './../../services/sync-custom/sync-custom.service';
import { GroupDeviceService } from './../../../../shared/services/group-device/group-device.service';
import { SyncSessionService } from './../../../sync/services/sync-session/sync-session.service';
import { Controller, Post, Param, Body } from '@nestjs/common';
const log = require('tangy-log').log

@Controller('sync-custom')
export class SyncCustomController {

  constructor(
    private readonly syncCustomService:SyncCustomService,
    private readonly groupDeviceService:GroupDeviceService
  ) { }
  
  @Post ('push/:groupId/:docId/:deviceId/:deviceToken')
  async start(@Param('groupId') groupId:string, @Param('docId') docId:string, @Param('deviceId') deviceId:string, @Param('deviceToken') deviceToken:string, @Body() data:any):Promise<any> {
    try {
      if (await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, deviceToken)) {
        return await this.syncCustomService.processPush(groupId, data)
      } else {

      }
    } catch (err) {
      log.error(`Error in sync-session/start`)
      console.log(err)
    }
  }

}
