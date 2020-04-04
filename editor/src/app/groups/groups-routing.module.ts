import { GroupCasesComponent } from './group-cases/group-cases.component';
import { GroupUploadsViewComponent } from './group-uploads-view/group-uploads-view.component';
import { GroupReleaseApkLiveComponent } from './group-release-apk-live/group-release-apk-live.component';
import { GroupReleaseApkTestComponent } from './group-release-apk-test/group-release-apk-test.component';
import { GroupReleasePwaLiveComponent } from './group-release-pwa-live/group-release-pwa-live.component';
import { GroupReleasePwaTestComponent } from './group-release-pwa-test/group-release-pwa-test.component';
import { GroupFormsCsvComponent } from './group-forms-csv/group-forms-csv.component';
import { GroupUploadsComponent } from './group-uploads/group-uploads.component';
import { GroupReleasesComponent } from './group-releases/group-releases.component';
import { ResponsesComponent } from './responses/responses.component';
import { GroupDevicesComponent } from './group-devices/group-devices.component';
import { GroupDeviceUsersComponent } from './group-device-users/group-device-users.component';
import { ListUsersComponent } from './list-users/list-users.component';
import { GroupFormsSyncComponent } from './group-forms-sync/group-forms-sync.component';
import { GroupLocationListComponent } from './group-location-list/group-location-list.component';
import { GroupFormsEditComponent } from './group-forms-edit/group-forms-edit.component';
import { GroupMediaComponent } from './group-media/group-media.component';
import { CaseManagementEditorComponent } from './case-management-editor/case-management-editor.component';
import { GroupFormsComponent } from './group-forms/group-forms.component';
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
import { GroupDeviceUserComponent } from './group-device-user/group-device-user.component';
import { CaseSettingsComponent } from './case-settings/case-settings.component';
import { GroupAnalyticsComponent } from './group-analytics/group-analytics.component';

const groupsRoutes: Routes = [
  // { path: 'projects', component: GroupsComponent },
  { path: '', component: GroupsComponent, canActivate: [LoginGuard] },
  { path: 'projects', component: GroupsComponent, canActivate: [LoginGuard] },
  { path: 'groups/new-group', component: NewGroupComponent, canActivate: [LoginGuard, AdminUserGuard] },
  { path: 'groups/:groupId', component: GroupComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/author', component: GroupAuthorComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/author/forms', component: GroupFormsComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/author/forms/edit/:formId', component: GroupFormsEditComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/author/case-definitions', component: CaseManagementEditorComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/author/media-library', component: GroupMediaComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/data', component: GroupDataComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/data/uploads', component: GroupUploadsComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/data/uploads/:responseId', component: GroupUploadsViewComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/data/download-csv', component: GroupFormsCsvComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/data/cases', component: GroupCasesComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/data/analytics', component: GroupAnalyticsComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure', component: GroupConfigureComponent, canActivate: [LoginGuard, AdminUserGuard] },
  { path: 'groups/:groupId/configure/location-list', component: GroupLocationListComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure/location-list/manage-location-list-metadata/:locationLevel', component: ManageLocationListMetadataComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure/sync', component: GroupFormsSyncComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure/case', component: CaseSettingsComponent, canActivate: [LoginGuard, AdminUserGuard] },
  { path: 'groups/:groupId/configure/security', component: ListUsersComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure/security/role/:username', component: AddUserComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy', component: GroupDeployComponent, canActivate: [LoginGuard, AdminUserGuard] },
  { path: 'groups/:groupId/deploy/device-users', component: GroupDeviceUsersComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/device-users/:responseId', component: GroupDeviceUserComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/devices', component: GroupDevicesComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/releases', component: GroupReleasesComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/releases/release-pwa-test', component: GroupReleasePwaTestComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/releases/release-pwa-live', component: GroupReleasePwaLiveComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/releases/release-apk-test', component: GroupReleaseApkTestComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/releases/release-apk-live', component: GroupReleaseApkLiveComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/support', component: SupportComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/addUser', component: AddUserComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupName/manage-location-list-levels', component: ManageLocationListLevelsComponent, canActivate: [LoginGuard] },
  {
    path: 'groups/:groupId/configure/location-list/import-location-list',
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
