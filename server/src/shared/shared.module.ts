import { Module } from '@nestjs/common';
import { GroupService } from './services/group/group.service';
import { TangerineConfigService } from './services/tangerine-config/tangerine-config.service';
import { ClientUserService } from './services/client-user/client-user.service';
import { SharedQueries } from './shared.queries';

@Module({
  exports: [
    ClientUserService,
    TangerineConfigService,
    GroupService
  ],
  providers: [
    TangerineConfigService,
    GroupService,
    ClientUserService
  ]
})
export class SharedModule {
  constructor(private readonly groupService:GroupService) {
    this.groupService.registerViews('shared', SharedQueries)
  }
}
