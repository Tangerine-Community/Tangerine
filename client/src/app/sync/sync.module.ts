import { DEFAULT_USER_DOCS } from './../shared/_tokens/default-user-docs.token';
import { SYNC_DOCS } from './sync.docs';
import { SyncCouchdbService } from './sync-couchdb.service';
import { SyncService } from './sync.service';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncCustomService } from './sync-custom.service';
import { SyncComponent } from './components/sync/sync.component';
import { PeersComponent} from '../core/sync-records/peers/peers.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatCardModule, MatIconModule, MatProgressBarModule, MatButtonModule, MatTabsModule} from '@angular/material';
// import { SyncRecodsRoutingModule } from '../core/sync-records/sync-records-routing.module';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [SyncComponent, PeersComponent],
  declarations: [SyncComponent, PeersComponent],
  providers: [
    {
      provide: DEFAULT_USER_DOCS,
      useValue: SYNC_DOCS,
      multi: true
    },
    SyncService,
    SyncCustomService,
    SyncCouchdbService

  ],
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    // SyncRecodsRoutingModule,
    MatTabsModule,
  ]
})
export class SyncModule { }
