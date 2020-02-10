import { SupportComponent } from './../support/support.component';
import { GroupDataComponent } from './group-data/group-data.component';
import { GroupConfigureComponent } from './group-configure/group-configure.component';
import { GroupAuthorComponent } from './group-author/group-author.component';
import { GroupComponent } from './group/group.component';
import { GroupDeployComponent } from './group-deploy/group-deploy.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginGuard } from '../core/auth/_guards/login-guard.service';
import { GroupDetailsComponent } from './group-details/group-details.component';
import { GroupsComponent } from './groups.component';
import { NewGroupComponent } from './new-group/new-group.component';
import { ReleaseApkComponent } from './release-apk/release-apk.component';
import { ReleasePwaComponent } from './release-pwa/release-pwa.component';
import { ReleaseDatComponent } from './release-dat/release-dat.component';
import { DownloadCsvComponent } from './download-csv/download-csv.component';
import { AddUserComponent } from './add-users/add-user.component';
import { ManageLocationListLevelsComponent } from './manage-location-list-levels/manage-location-list-levels.component';
import { ManageLocationListMetadataComponent } from './manage-location-list-metadata/manage-location-list-metadata.component';
import { SuperAdminUserGuard } from '../core/auth/_guards/super-admin-user-guard.service';
import { AdminUserGuard } from '../core/auth/_guards/admin-user-guard.service';
import { ImportLocationListComponent } from './import-location-list/import-location-list.component';
import { CreateCaseDefinitionComponent } from './case-management-editor/create-case-definition/create-case-definition.component';
import { PrintFormAsTableComponent } from './print-form-as-table/print-form-as-table.component';

const groupsRoutes: Routes = [
  // { path: 'projects', component: GroupsComponent },
  { path: '', component: GroupsComponent, canActivate: [LoginGuard] },
  { path: 'projects', component: GroupsComponent, canActivate: [LoginGuard] },
  { path: 'groups/new-group', component: NewGroupComponent, canActivate: [LoginGuard, SuperAdminUserGuard] },
  { path: 'groups/:groupId', component: GroupComponent, canActivate: [LoginGuard] },
  {
    path: 'groups/:groupId', component: GroupDetailsComponent, canActivate: [LoginGuard, SuperAdminUserGuard]
  },
  { path: 'groups/:groupId/deploy', component: GroupDeployComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/author', component: GroupAuthorComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/data', component: GroupDataComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure', component: GroupConfigureComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/support', component: SupportComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupName/addUser', component: AddUserComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupName/manage-location-list-levels', component: ManageLocationListLevelsComponent, canActivate: [LoginGuard] },
  {
    path: 'groups/:groupId/import-location-list',
    component: ImportLocationListComponent, canActivate: [LoginGuard, AdminUserGuard]
  },
  {
    path: 'groups/:groupId/manage-location-list-metadata/:locationLevel',
    component: ManageLocationListMetadataComponent, canActivate: [LoginGuard]
  },
  { path: 'groups/:groupName/data/download-csv/:formId', component: DownloadCsvComponent, canActivate: [LoginGuard] },
  { path: 'group/release-apk/:id/:releaseType', component: ReleaseApkComponent, canActivate: [LoginGuard] },
  { path: 'group/release-pwa/:id/:releaseType', component: ReleasePwaComponent, canActivate: [LoginGuard] },
  { path: 'group/release-dat/:id/:releaseType', component: ReleaseDatComponent, canActivate: [LoginGuard] },
  {
    path: 'groups/:groupId/define-case-definition', component: CreateCaseDefinitionComponent,
    canActivate: [LoginGuard, SuperAdminUserGuard]
  },
  { path: 'groups/:groupId/printFormAsTable/:formId', component: PrintFormAsTableComponent, canActivate: [LoginGuard] },
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
