import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard }                from '../auth-guard.service';

import { GroupsComponent }    from './groups.component';
const groupsRoutes: Routes = [
  //{ path: 'projects',  component: GroupsComponent },
  { path: 'projects', component: GroupsComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(groupsRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class GroupsRoutingModule { }
