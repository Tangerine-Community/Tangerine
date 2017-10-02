import { NgModule } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SyncRecordsComponent } from './sync-records/sync-records.component';
import { UploadGuardService } from '../auth/_guards/upload-guard.service';
const routes = [{
  path: 'sync-records',
  component: SyncRecordsComponent,
  canActivate: [UploadGuardService]
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class SyncRecodsRoutingModule { }
