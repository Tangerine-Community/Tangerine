import {HttpModule, Module} from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { SyncSessionService } from './services/sync-session/sync-session.service';
import { SyncSessionController } from './controllers/sync-session/sync-session.controller';

@Module({
  imports: [ SharedModule, HttpModule ],
  exports: [ SyncSessionService ],
  providers: [ SyncSessionService ],
  controllers: [ SyncSessionController ]
})
export class SyncModule {}
