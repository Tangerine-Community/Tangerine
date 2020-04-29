import { SyncCustomModule } from './modules/sync-custom/sync-custom.module';
import {HttpModule, Module} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { SyncModule } from './modules/sync/sync.module';

@Module({
  imports: [
    CoreModule,
    SharedModule,
    SyncModule,
    SyncCustomModule,
    HttpModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(appService: AppService) {
    appService.start()
  }
}
