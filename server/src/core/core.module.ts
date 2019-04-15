import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { StartSyncSessionController } from './start-sync-session/start-sync-session.controller';
import { SharedModule } from '../shared/shared.module';
import { GroupController } from './group/group.controller';
import { UserController } from './user/user.controller';
import isAuthenticated = require('../middleware/is-authenticated')

@Module({
  controllers: [StartSyncSessionController, GroupController, UserController],
  imports: [SharedModule]
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(isAuthenticated)
      .forRoutes(GroupController);
  }
}
