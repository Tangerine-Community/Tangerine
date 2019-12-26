import { SharedModule } from './../../shared/shared.module';
import { SyncCustomService } from './services/sync-custom/sync-custom.service';
import { SyncCustomController } from './controllers/sync-custom/sync-custom.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [ SharedModule ],
  controllers: [ SyncCustomController ],
  providers: [ SyncCustomService ]
})
export class SyncCustomModule {
}
