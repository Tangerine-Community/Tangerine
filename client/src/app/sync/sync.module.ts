import { DEFAULT_USER_DOCS } from './../shared/_tokens/default-user-docs.token';
import { SYNC_DOCS } from './sync.docs';
import { SyncCouchdbService } from './sync-couchdb.service';
import { SyncService } from './sync.service';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncCustomService } from './sync-custom.service';
import { SyncComponent } from './components/sync/sync.component';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [SyncComponent],
  declarations: [SyncComponent],
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
    CommonModule
  ]
})
export class SyncModule { }
