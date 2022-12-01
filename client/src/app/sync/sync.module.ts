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
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { SyncMenuComponent } from './sync-menu/sync-menu.component';
import {MatLegacyCheckboxModule as MatCheckboxModule} from "@angular/material/legacy-checkbox";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatLegacySlideToggleModule as MatSlideToggleModule} from "@angular/material/legacy-slide-toggle";
import {MatLegacyRadioModule as MatRadioModule} from "@angular/material/legacy-radio";
import {SyncMediaService} from "./sync-media.service";

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
    SyncCouchdbService,
    SyncMediaService
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
    MatCheckboxModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatRadioModule,
  ]
})
export class SyncModule { }
