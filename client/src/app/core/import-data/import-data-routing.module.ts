import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {ImportDataComponent} from "./import-data/import-data.component";
import {LoginGuard} from "../../shared/_guards/login-guard.service";
import {CreateProfileGuardService} from "../../shared/_guards/create-profile-guard.service";

const routes = [{
  path: 'import-data',
  component: ImportDataComponent,
  canActivate: [LoginGuard]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class ImportDataRoutingModule { }
