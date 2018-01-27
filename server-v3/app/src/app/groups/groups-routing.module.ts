import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard }                from '../auth-guard.service';

import { GroupsComponent }    from './groups.component';
import { GroupComponent }    from './group/group.component';
import { NewGroupComponent }    from './new-group/new-group.component';
const groupsRoutes: Routes = [
  //{ path: 'projects',  component: GroupsComponent },
  { path: 'projects', component: GroupsComponent, canActivate: [AuthGuard] },
  { path: 'new-group', component: NewGroupComponent, canActivate: [AuthGuard] },
  { path: 'group/:id', component: GroupComponent, canActivate: [AuthGuard] },
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
