import { Module } from '@nestjs/common';
import { StartSyncSessionController } from './start-sync-session/start-sync-session.controller';

@Module({
  controllers: [StartSyncSessionController]
})
export class CoreModule {}
