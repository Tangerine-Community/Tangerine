import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatInputModule, MatCardModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';
import { SyncingService } from './_services/syncing.service';
import { SyncRecodsRoutingModule } from './sync-records-routing.module';
import { SyncRecordsComponent } from './sync-records/sync-records.component';
import { SharedModule } from '../../shared/shared.module';
import { TwoWaySyncModule } from 'src/app/two-way-sync/two-way-sync.module';
import { PeersComponent } from './peers/peers.component';
import { MatChipsModule } from '@angular/material/chips';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SyncRecodsRoutingModule,
    TwoWaySyncModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatExpansionModule,
    MatChipsModule,
    MatButtonToggleModule,
    SharedModule
  ],
  declarations: [SyncRecordsComponent, PeersComponent],
  providers: [SyncingService, HttpClientModule],
})
export class SyncRecordsModule { }
