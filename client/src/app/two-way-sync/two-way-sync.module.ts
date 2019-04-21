import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwoWaySyncComponent } from './components/two-way-sync/two-way-sync.component';
import { SharedModule } from '../shared/shared.module';
import { DEFAULT_USER_DOCS } from '../shared/_tokens/default-user-docs.token';
import { HttpClientModule } from '@angular/common/http';
import { TwoWaySyncService } from './services/two-way-sync.service';
import { MatCardModule, MatButtonModule } from '@angular/material';
import { TwoWaySyncRoutingModule } from './two-way-sync-routing.module';
import { TangyFormsModule } from '../tangy-forms/tangy-forms.module';
import { TWO_WAY_SYNC_DEFAULT_USER_DOCS } from './two-way-sync.docs';

@NgModule({
  exports: [TwoWaySyncComponent],
  declarations: [TwoWaySyncComponent],
  providers: [
    {
      provide: DEFAULT_USER_DOCS,
      useValue: TWO_WAY_SYNC_DEFAULT_USER_DOCS,
      multi: true
    },
    TwoWaySyncService
  ],
  imports: [
    CommonModule,
    TwoWaySyncRoutingModule,
    TangyFormsModule,
    SharedModule,
    MatCardModule,
    MatButtonModule,
    HttpClientModule
  ]
})
export class TwoWaySyncModule { }
