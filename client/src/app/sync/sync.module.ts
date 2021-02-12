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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { SyncMenuComponent } from './sync-menu/sync-menu.component';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [SyncComponent, PeersComponent, SyncMenuComponent],
  declarations: [SyncComponent, PeersComponent, SyncMenuComponent],
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
    MatTabsModule,
    MatChipsModule,
  ]
})
export class SyncModule { }
