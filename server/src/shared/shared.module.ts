import { GroupResponsesService } from './services/group-responses/group-responses.service';
import { GroupDeviceService } from './services/group-device/group-device.service';
import { Module, HttpService } from '@nestjs/common';
import { GroupService } from './services/group/group.service';
import { TangerineConfigService } from './services/tangerine-config/tangerine-config.service';
import { ClientUserService } from './services/client-user/client-user.service';
import { SharedQueries } from './shared.queries';
import { UserService } from './services/user/user.service';
import { DbService } from './services/db/db.service';

@Module({
  exports: [
    DbService,
    ClientUserService,
    TangerineConfigService,
    GroupService,
    GroupDeviceService,
    GroupResponsesService,
    UserService
  ],
  providers: [
    DbService,
    TangerineConfigService,
    GroupService,
    GroupDeviceService,
    GroupResponsesService,
    ClientUserService,
    UserService
  ]
})
export class SharedModule {
  constructor(private readonly groupService:GroupService) {
    this.groupService.registerViews('shared', SharedQueries)
  }
}
