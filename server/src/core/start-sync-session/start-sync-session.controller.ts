import { Controller, Post, Param} from '@nestjs/common';
import { SyncSession } from 'src/shared/classes/sync-session';

@Controller('api/start-sync-session')
export class StartSyncSessionController {
  @Post()
  start(@Param('profileId') profileId, @Param('groupId') groupId):SyncSession {
    return <SyncSession>{
      syncUrl: 'http://test:test@localhost/group/group1',
      doc_ids: ['1']
    }

  }

}
