import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncRecodsRoutingModule } from './sync-recods-routing.module';
import { SyncRecordsComponent } from './sync-records/sync-records.component';
import { SyncingService } from './_services/syncing.service';
import { UploadGuardService } from '../auth/_guards/upload-guard.service';

@NgModule({
  imports: [
    CommonModule,
    SyncRecodsRoutingModule
  ],
  declarations: [SyncRecordsComponent],
  providers: [SyncingService, UploadGuardService],
})
export class SyncRecordsModule { }
