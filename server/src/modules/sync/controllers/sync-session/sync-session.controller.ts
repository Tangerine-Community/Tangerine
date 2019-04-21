import { Controller, Get, Param, Post } from '@nestjs/common';
import { SyncSession } from '../../classes/sync-session.class';
import { SyncSessionService } from '../../services/sync-session/sync-session.service';
const log = require('tangy-log').log

@Controller('sync-session')
export class SyncSessionController {

  constructor(
    private readonly syncSessionService:SyncSessionService
  ) { }

  @Get ('start/:groupId/:profileId')
  async start(@Param('groupId') groupId:string, @Param('profileId') profileId:string):Promise<SyncSession> {
    try {
      return await this.syncSessionService.start(groupId, profileId)
    } catch (err) {
      log.warn(`Error in sync-session/start: ${JSON.stringify(err)}`)
    }
  }

}

