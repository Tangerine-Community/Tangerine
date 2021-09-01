import {HttpModule, Module} from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { SyncSessionService } from './services/sync-session/sync-session.service';
import { SyncSessionController } from './controllers/sync-session/sync-session.controller';
import {BulkSyncController} from "./controllers/bulk-sync/bulk-sync.controller";
import {BulkSyncService} from "./services/bulk-sync/bulk-sync.service";

@Module({
  imports: [ SharedModule, HttpModule ],
  exports: [ SyncSessionService, BulkSyncService ],
  providers: [ SyncSessionService, BulkSyncService ],
  controllers: [ SyncSessionController, BulkSyncController ]
})
export class SyncModule {}
