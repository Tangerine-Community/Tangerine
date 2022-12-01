import { SyncModule } from './../../sync/sync.module';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatExpansionModule } from '@angular/material/expansion';
import { SyncingService } from './_services/syncing.service';
import { SyncRecordsRoutingModule } from './sync-records-routing.module';
import { SyncRecordsComponent } from './sync-records/sync-records.component';
import { SharedModule } from '../../shared/shared.module';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatLegacyProgressBarModule as MatProgressBarModule} from "@angular/material/legacy-progress-bar";
import {MatIconModule} from "@angular/material/icon";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SyncRecordsRoutingModule,
    SyncModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatExpansionModule,
    MatChipsModule,
    MatButtonToggleModule,
    SharedModule,
    MatProgressBarModule,
    MatIconModule
  ],
  declarations: [SyncRecordsComponent],
  providers: [SyncingService, HttpClientModule],
})
export class SyncRecordsModule { }
