import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginGuard } from '../auth/_guards/login-guard.service';
import { SyncRecordsComponent } from './sync-records/sync-records.component';

const routes: Routes = [{
  path: 'sync-records',
  component: SyncRecordsComponent,
  canActivate: [LoginGuard]
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class SyncRecodsRoutingModule { }
