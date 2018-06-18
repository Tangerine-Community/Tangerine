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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SyncRecodsRoutingModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatExpansionModule,
    SharedModule
  ],
  declarations: [SyncRecordsComponent],
  providers: [SyncingService, HttpClientModule],
})
export class SyncRecordsModule { }
