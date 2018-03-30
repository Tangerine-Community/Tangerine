import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard }                from '../auth-guard.service';

import { GroupsComponent }    from './groups.component';
import { GroupComponent }    from './group/group.component';
import { NewGroupComponent }    from './new-group/new-group.component';
import { ReleaseApkComponent }    from './release-apk/release-apk.component';
import { ReleasePwaComponent }    from './release-pwa/release-pwa.component';
const groupsRoutes: Routes = [
  //{ path: 'projects',  component: GroupsComponent },
  { path: 'projects', component: GroupsComponent, canActivate: [AuthGuard] },
  { path: 'new-group', component: NewGroupComponent, canActivate: [AuthGuard] },
  { path: 'group/:id', component: GroupComponent, canActivate: [AuthGuard] },
  { path: 'group/release-apk/:id/:releaseType', component: ReleaseApkComponent, canActivate: [AuthGuard] },
  { path: 'group/release-pwa/:id', component: ReleasePwaComponent, canActivate: [AuthGuard] },
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
