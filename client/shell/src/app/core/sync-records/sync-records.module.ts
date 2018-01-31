import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatInputModule, MatCardModule } from '@angular/material';

import { UploadGuardService } from '../auth/_guards/upload-guard.service';
import { SyncingService } from './_services/syncing.service';
import { SyncRecodsRoutingModule } from './sync-records-routing.module';
import { SyncRecordsComponent } from './sync-records/sync-records.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SyncRecodsRoutingModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule
  ],
  declarations: [SyncRecordsComponent],
  providers: [SyncingService, UploadGuardService],
})
export class SyncRecordsModule { }
