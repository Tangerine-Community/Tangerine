import { GroupDashboardComponent } from './group-dashboard/group-dashboard.component';
import { IssueFormComponent } from './../case/components/issue-form/issue-form.component';
import { IssueComponent } from './../case/components/issue/issue.component';
import { GroupIssuesComponent } from './group-issues/group-issues.component';
import { GroupCasesComponent } from './group-cases/group-cases.component';
import { GroupUploadsViewComponent } from './group-uploads-view/group-uploads-view.component';
import { GroupReleaseApkLiveComponent } from './group-release-apk-live/group-release-apk-live.component';
import { GroupReleaseApkTestComponent } from './group-release-apk-test/group-release-apk-test.component';
import { GroupReleasePwaLiveComponent } from './group-release-pwa-live/group-release-pwa-live.component';
import { GroupReleasePwaTestComponent } from './group-release-pwa-test/group-release-pwa-test.component';
import { GroupFormsCsvComponent } from './group-forms-csv/group-forms-csv.component';
import { GroupUploadsComponent } from './group-uploads/group-uploads.component';
import { GroupReleasesComponent } from './group-releases/group-releases.component';
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
import { GroupsComponent } from './groups.component';
import { NewGroupComponent } from './new-group/new-group.component';
import { ReleaseApkComponent } from './release-apk/release-apk.component';
import { ReleasePwaComponent } from './release-pwa/release-pwa.component';
import { ReleaseDatComponent } from './release-dat/release-dat.component';
import { DownloadCsvComponent } from './download-csv/download-csv.component';
import { ManageLocationListLevelsComponent } from './manage-location-list-levels/manage-location-list-levels.component';
import { ManageLocationListMetadataComponent } from './manage-location-list-metadata/manage-location-list-metadata.component';
import { SuperAdminUserGuard } from '../core/auth/_guards/super-admin-user-guard.service';
import { ImportLocationListComponent } from './import-location-list/import-location-list.component';
import { CreateCaseDefinitionComponent } from './case-management-editor/create-case-definition/create-case-definition.component';
import { PrintFormAsTableComponent } from './print-form-as-table/print-form-as-table.component';
import { GroupDeviceUserComponent } from './group-device-user/group-device-user.component';
import { CaseSettingsComponent } from './case-settings/case-settings.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { ConfigureGroupSecurityComponent } from './configure-group-security/configure-group-security.component';
import { AddRoleToGroupComponent } from '../core/auth/_components/add-role-to-group/add-role-to-group.component';
import { UpdateGroupRolesComponent } from '../core/auth/_components/update-group-roles/update-group-roles.component';
import { AddUserToAGroupComponent } from '../core/auth/_components/add-user-to-a-group/add-user-to-a-group.component';
import { UpdateUserRoleComponent } from '../core/auth/_components/update-user-role/update-user-role.component';
import { GroupDeviceSheetComponent } from './group-device-sheet/group-device-sheet.component';
import {MatTableModule} from "@angular/material/table";
import {CommonModule} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import { PrintFormBackupComponent } from './print-form-backup/print-form-backup.component';
import { PrintStimuliScreenComponent } from './print-stimuli-screen/print-stimuli-screen.component';
import { ReleaseOnlineSurveyComponent } from './release-online-survey/release-online-survey.component';
import { HistoricalReleasesApkTestComponent } from './historical-releases-apk-test/historical-releases-apk-test.component';
import { HistoricalReleasesApkLiveComponent } from './historical-releases-apk-live/historical-releases-apk-live.component';
import { HistoricalReleasesPwaLiveComponent } from './historical-releases-pwa-live/historical-releases-pwa-live.component';
import { HistoricalReleasesPwaTestComponent } from './historical-releases-pwa-test/historical-releases-pwa-test.component';
import { CsvDataSetsComponent } from './csv-data-sets/csv-data-sets.component';
import { NewCsvDataSetComponent } from './new-csv-data-set/new-csv-data-set.component';
import { CsvDataSetDetailComponent } from './csv-data-set-detail/csv-data-set-detail.component';
import { GroupDatabaseConflictsComponent } from './group-database-conflicts/group-database-conflicts.component';

const groupsRoutes: Routes = [
  // { path: 'projects', component: GroupsComponent },
  { path: '', component: GroupsComponent, canActivate: [LoginGuard] },
  { path: 'projects', component: GroupsComponent, canActivate: [LoginGuard] },
  { path: 'groups/new-group', component: NewGroupComponent, canActivate: [LoginGuard, NgxPermissionsGuard], data:{permissions:{only:['can_create_group'], redirectTo:'/projects'}} },
  { path: 'groups/:groupId', component: GroupComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/dashboard', component: GroupDashboardComponent, canActivate: [LoginGuard] },
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
  { path: 'groups/:groupId/data/issues/:issueId/form-revision', component: IssueFormComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/data/issues/:issueId/form-revision/:eventId', component: IssueFormComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/data/issues/:issueId', component: IssueComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/data/issues', component: GroupIssuesComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/data/database-conflicts', component: GroupDatabaseConflictsComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure', component: GroupConfigureComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure/location-list', component: GroupLocationListComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure/location-list/manage-location-list-metadata/:locationLevel', component: ManageLocationListMetadataComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure/sync', component: GroupFormsSyncComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure/case', component: CaseSettingsComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure/security', component: ConfigureGroupSecurityComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure/security/assign-role', component: ListUsersComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure/security/configure-roles/add-role', component: AddRoleToGroupComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure/security/update-role/:roleName', component: UpdateGroupRolesComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure/security/role/:username', component: UpdateUserRoleComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy', component: GroupDeployComponent, canActivate: [LoginGuard ]},
  { path: 'groups/:groupId/deploy/device-users', component: GroupDeviceUsersComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/onlineSurvey', component: ReleaseOnlineSurveyComponent, canActivate: [LoginGuard ]},
  { path: 'groups/:groupId/deploy/device-users/new', component: GroupDeviceUserComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/device-users/:responseId', component: GroupDeviceUserComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/devices', component: GroupDevicesComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/device-sheet', component: GroupDeviceSheetComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/releases', component: GroupReleasesComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/releases/release-pwa-test', component: GroupReleasePwaTestComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/releases/release-pwa-live', component: GroupReleasePwaLiveComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/releases/release-apk-test', component: GroupReleaseApkTestComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/releases/release-apk-live', component: GroupReleaseApkLiveComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/releases/historical-releases-apk-test', component: HistoricalReleasesApkTestComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/releases/historical-releases-apk-live', component: HistoricalReleasesApkLiveComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/releases/historical-releases-pwa-test', component: HistoricalReleasesPwaTestComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/deploy/releases/historical-releases-pwa-live', component: HistoricalReleasesPwaLiveComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/support', component: SupportComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/configure/security/add-user', component: AddUserToAGroupComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupName/manage-location-list-levels', component: ManageLocationListLevelsComponent, canActivate: [LoginGuard] },
  {
    path: 'groups/:groupId/configure/location-list/import-location-list',
    component: ImportLocationListComponent, canActivate: [LoginGuard]
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
  { path: 'groups/:groupId/printFormBackup/:formId', component: PrintFormBackupComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/printStimuliScreen/:formId', component: PrintStimuliScreenComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/data/csv-data-sets', component: CsvDataSetsComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/data/csv-data-sets/new', component: NewCsvDataSetComponent, canActivate: [LoginGuard] },
  { path: 'groups/:groupId/data/csv-data-sets/:dataSetId', component: CsvDataSetDetailComponent, canActivate: [LoginGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(groupsRoutes),
    MatTableModule,
    CommonModule,
    TranslateModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [GroupDeviceSheetComponent]
})
export class GroupsRoutingModule { }
