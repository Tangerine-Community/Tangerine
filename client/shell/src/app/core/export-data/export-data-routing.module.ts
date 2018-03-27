import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ExportDataComponent } from './export-data/export-data.component';
import { LoginGuard } from '../auth/_guards/login-guard.service';
import { CreateProfileGuardService } from '../../user-profile/create-profile-guard.service';
const routes = [{
  path: 'export-data',
  component: ExportDataComponent,
  canActivate: [LoginGuard, CreateProfileGuardService]
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class ExportDataRoutingModule { }
