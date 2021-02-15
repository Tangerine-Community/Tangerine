import { ModuleController } from './tangerine-modules-support/tangerine-modules-support.controller';
import { GroupDevicePublicController } from './group-device/group-device-public.controller';
import { GroupDeviceManageController } from './group-device/group-device-manage.controller';
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { GroupController } from './group/group.controller';
import { UserController } from './user/user.controller';
import { ConfigController } from './config/config.controller';
import { GroupResponsesController } from './group-responses/group-responses.controller';
import isAuthenticated = require('../middleware/is-authenticated');
import {GroupIssuesController} from "./group-issues/group-issues.controller";
const {permit} = require('../middleware/permitted');

@Module({
  controllers: [
    GroupController,
    UserController,
    GroupDevicePublicController,
    GroupDeviceManageController,
    ConfigController,
    GroupResponsesController,
    GroupIssuesController
  ],
  imports: [SharedModule]
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(isAuthenticated)
      .forRoutes(ConfigController)
    consumer
      .apply(isAuthenticated)
      .forRoutes(ModuleController)
    consumer
      .apply(isAuthenticated)
      .forRoutes(GroupController)
    consumer
      .apply(isAuthenticated)
      .forRoutes(GroupResponsesController)
    consumer
      .apply(isAuthenticated)
      .forRoutes(GroupIssuesController)
    consumer
      .apply(isAuthenticated)
      .forRoutes(UserController)
    consumer
      .apply(isAuthenticated)
      .forRoutes(GroupDeviceManageController)
    consumer
      .apply(isAuthenticated, permit(['can_create_group']))
      .forRoutes({path: 'nest/group/create', method: RequestMethod.POST});
  }
}
