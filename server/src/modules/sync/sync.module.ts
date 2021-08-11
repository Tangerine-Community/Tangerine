import {HttpModule, Module} from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { SyncSessionService } from './services/sync-session/sync-session.service';
import { SyncSessionController } from './controllers/sync-session/sync-session.controller';
import {BulkSyncController} from "./controllers/bulk-sync/bulk-sync.controller";
import {BulkSyncService} from "./services/bulk-sync/bulk-sync.service";
import { SyncSessionv2Service } from './services/sync-session/sync-session-v2.service';
import { SyncSessionv2Controller } from './controllers/sync-session/sync-session-v2.controller';

@Module({
  imports: [ SharedModule, HttpModule ],
  exports: [ SyncSessionService, SyncSessionv2Service, BulkSyncService ],
  providers: [ SyncSessionService, SyncSessionv2Service, BulkSyncService ],
  controllers: [ SyncSessionController, SyncSessionv2Controller, BulkSyncController ]
})
export class SyncModule {}
