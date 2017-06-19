import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {GroupManagerComponent} from "./group-manager.component";

const routes: Routes = [ {
  path: 'create-group',
  component: GroupManagerComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupManagerRoutingModule { }
