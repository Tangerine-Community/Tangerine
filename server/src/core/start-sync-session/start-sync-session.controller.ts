import { Controller, Post, Param} from '@nestjs/common';
import { SyncSession } from 'src/shared/classes/sync-session';
//import { GroupService } from 'src/shared/services/group/group.service';
import { GroupService } from '../../shared/services/group/group.service';
import { ClientUserService } from '../../shared/services/client-user/client-user.service';

@Controller('api/start-sync-session')
export class StartSyncSessionController {


  constructor(
    private readonly groupService:GroupService, 
    private readonly clientUserService:ClientUserService) {
    this.groupService = groupService
    this.clientUserService = clientUserService
  }

  @Post()
  start(@Param('profileId') profileId, @Param('groupId') groupId):SyncSession {
    return <SyncSession>{
      syncUrl: this.groupService.getSyncUrl(groupId),
      doc_ids: this.clientUserService.getSyncDocIds(groupId, profileId)
    }
  }

}
