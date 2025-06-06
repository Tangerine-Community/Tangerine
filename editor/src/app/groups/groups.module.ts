import { ManageGroupRolesPermissionsComponent } from './manage-group-roles-permissions/manage-group-roles-permissions.component';
import { GroupIssuesComponent } from './group-issues/group-issues.component';
import { TangyFormsModule } from './../tangy-forms/tangy-forms.module';
import { NgTangyFormEditorModule } from './../ng-tangy-form-editor/ng-tangy-form-editor.module';
import { GroupFormsSyncComponent } from './group-forms-sync/group-forms-sync.component';
import { GroupFormsCsvComponent } from './group-forms-csv/group-forms-csv.component';
import { MatTableModule } from '@angular/material/table';
import { TangyFormService } from './../tangy-forms/tangy-form.service';
import { GroupDevicesService } from './services/group-devices.service';
import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GroupComponent } from './group/group.component';
import { GroupsRoutingModule } from './groups-routing.module';
import { GroupsComponent } from './groups.component';
import { NewGroupComponent } from './new-group/new-group.component';
import { ReleaseApkComponent } from './release-apk/release-apk.component';
import { ReleasePwaComponent } from './release-pwa/release-pwa.component';
import { GroupsService } from './services/groups.service';
import { TangerineFormsService } from './services/tangerine-forms.service';
import { FilesService } from './services/files.service';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DownloadCsvComponent } from './download-csv/download-csv.component';
import { AddUserComponent } from './add-users/add-user.component';
import { ListUsersComponent } from './list-users/list-users.component';
import { ReleaseDatComponent } from './release-dat/release-dat.component';
import { ResponsesComponent } from './responses/responses.component';
import { LocationListEditorComponent } from './location-list-editor/location-list-editor.component';
import { ManageLocationListLevelsComponent } from './manage-location-list-levels/manage-location-list-levels.component';
import { ManageLocationListMetadataComponent } from './manage-location-list-metadata/manage-location-list-metadata.component';
import { ImportLocationListComponent } from './import-location-list/import-location-list.component';
import { CaseManagementEditorComponent } from './case-management-editor/case-management-editor.component';
import { CreateCaseDefinitionComponent } from './case-management-editor/create-case-definition/create-case-definition.component';
import { CreateCaseDefinitionStructureComponent } from './case-management-editor/create-case-definition-structure/create-case-definition-structure.component';
import { EditCaseDefinitionComponent } from './case-management-editor/edit-case-definition/edit-case-definition.component';
import { EditEventDefinitionComponent } from './case-management-editor/edit-event-definition/edit-event-definition.component';
import { EditEventFormDefinitionComponent } from './case-management-editor/edit-event-form-definition/edit-event-form-definition.component';
import { CreateEventFormDefinitionComponent } from './case-management-editor/create-event-form-definition/create-event-form-definition.component';
import { CreateEventDefinitionComponent } from './case-management-editor/create-event-definition/create-event-definition.component';
import { GroupMediaComponent } from './group-media/group-media.component';
import { PrintFormAsTableComponent } from './print-form-as-table/print-form-as-table.component';
import { CopyFormComponent } from './copy-form/copy-form.component';
import { GroupDevicesComponent } from './group-devices/group-devices.component';
import { GroupDeployComponent } from './group-deploy/group-deploy.component';
import { GroupAuthorComponent } from './group-author/group-author.component';
import { GroupDataComponent } from './group-data/group-data.component';
import { GroupConfigureComponent } from './group-configure/group-configure.component';
import { GroupFormsComponent } from './group-forms/group-forms.component';
import { GroupReleasesComponent } from './group-releases/group-releases.component';
import { GroupFormsEditComponent } from './group-forms-edit/group-forms-edit.component';
import { GroupLocationListComponent } from './group-location-list/group-location-list.component';
import { GroupDeviceUsersComponent } from './group-device-users/group-device-users.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'
import { GroupUploadsComponent } from './group-uploads/group-uploads.component';
import { GroupReleaseApkTestComponent } from './group-release-apk-test/group-release-apk-test.component';
import { GroupReleaseApkLiveComponent } from './group-release-apk-live/group-release-apk-live.component';
import { GroupReleasePwaTestComponent } from './group-release-pwa-test/group-release-pwa-test.component';
import { GroupReleasePwaLiveComponent } from './group-release-pwa-live/group-release-pwa-live.component';
import { GroupUploadsViewComponent } from './group-uploads-view/group-uploads-view.component';
import { GroupDeviceUserComponent } from './group-device-user/group-device-user.component';
import { GroupCasesComponent } from './group-cases/group-cases.component';
import { CaseSettingsComponent } from './case-settings/case-settings.component';
import { ConfigureGroupSecurityComponent } from './configure-group-security/configure-group-security.component';
import { BrowserModule } from '@angular/platform-browser';
import { ExportLocationListComponent } from './export-location-list/export-location-list.component';
import { GroupDashboardComponent } from './group-dashboard/group-dashboard.component';
import { PrintFormBackupComponent } from './print-form-backup/print-form-backup.component';
import { PrintStimuliScreenComponent } from './print-stimuli-screen/print-stimuli-screen.component';
import { ReleaseOnlineSurveyComponent } from './release-online-survey/release-online-survey.component';
import { GroupSearchComponent } from './group-search/group-search.component';
import { HistoricalReleasesPwaLiveComponent } from './historical-releases-pwa-live/historical-releases-pwa-live.component';
import { HistoricalReleasesPwaTestComponent } from './historical-releases-pwa-test/historical-releases-pwa-test.component';
import { HistoricalReleasesApkLiveComponent } from './historical-releases-apk-live/historical-releases-apk-live.component';
import { HistoricalReleasesApkTestComponent } from './historical-releases-apk-test/historical-releases-apk-test.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CsvDataSetsComponent } from './csv-data-sets/csv-data-sets.component';
import { NewCsvDataSetComponent } from './new-csv-data-set/new-csv-data-set.component';
import { CsvDataSetDetailComponent } from './csv-data-set-detail/csv-data-set-detail.component';
import { CsvTemplateComponent } from './csv-template/csv-template.component';
import { GroupCsvTemplatesComponent } from './group-csv-templates/group-csv-templates.component';
import { GroupDatabaseConflictsComponent } from './group-database-conflicts/group-database-conflicts.component';
import { DownloadStatisticalFileComponent } from './download-statistical-file/download-statistical-file.component';
import { GroupDevicePasswordPolicyComponent } from './group-device-password-policy/group-device-password-policy.component';
import { GroupLocationListsComponent } from './group-location-lists/group-location-lists.component';
import { GroupLocationListNewComponent } from './group-location-list-new/group-location-list-new.component';
import { GroupUploadsEditComponent } from './group-uploads-edit/group-uploads-edit.component';


@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        BrowserModule,
        MatGridListModule,
        FormsModule,
        DragDropModule,
        ReactiveFormsModule,
        MatInputModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatSelectModule,
        GroupsRoutingModule,
        MatCardModule,
        MatListModule,
        MatTabsModule,
        MatChipsModule,
        MatTableModule,
        MatIconModule,
        MatMenuModule,
        MatTreeModule,
        MatProgressSpinnerModule,
        MatGridListModule,
        MatSelectModule,
        MatFormFieldModule,
        MatSlideToggleModule,
        TangyFormsModule,
        SharedModule,
        NgTangyFormEditorModule,
        MatCheckboxModule,
        MatPaginatorModule,
        MatButtonModule
    ],
  declarations: [
    LocationListEditorComponent,
    ManageGroupRolesPermissionsComponent,
    GroupsComponent,
    GroupComponent,
    NewGroupComponent,
    ReleaseApkComponent,
    ReleasePwaComponent,
    DownloadCsvComponent,
    AddUserComponent,
    ListUsersComponent,
    ReleaseDatComponent,
    ResponsesComponent,
    ManageLocationListLevelsComponent,
    ManageLocationListMetadataComponent,
    ImportLocationListComponent,
    GroupMediaComponent,
    CaseManagementEditorComponent,
    CreateCaseDefinitionComponent,
    CreateCaseDefinitionStructureComponent,
    EditCaseDefinitionComponent,
    EditEventDefinitionComponent,
    EditEventFormDefinitionComponent,
    CreateEventFormDefinitionComponent,
    CreateEventDefinitionComponent,
    PrintFormAsTableComponent,
    CopyFormComponent,
    GroupDevicesComponent,
    GroupDeployComponent,
    GroupAuthorComponent,
    GroupDataComponent,
    GroupConfigureComponent,
    GroupFormsComponent,
    GroupFormsCsvComponent,
    GroupFormsSyncComponent,
    GroupReleasesComponent,
    GroupFormsEditComponent,
    GroupLocationListComponent,
    GroupLocationListsComponent,
    GroupLocationListNewComponent,
    GroupDeviceUsersComponent,
    GroupUploadsComponent,
    GroupReleaseApkTestComponent,
    GroupReleaseApkLiveComponent,
    GroupReleasePwaTestComponent,
    GroupReleasePwaLiveComponent,
    GroupUploadsViewComponent,
    GroupDeviceUserComponent,
    GroupCasesComponent,
    GroupIssuesComponent,
    CsvTemplateComponent,
    CaseSettingsComponent,
    ConfigureGroupSecurityComponent,
    ExportLocationListComponent,
    GroupDashboardComponent,
    PrintFormBackupComponent,
    PrintStimuliScreenComponent,
    ReleaseOnlineSurveyComponent,
    GroupSearchComponent,
    HistoricalReleasesPwaLiveComponent,
    HistoricalReleasesPwaTestComponent,
    HistoricalReleasesApkLiveComponent,
    HistoricalReleasesApkTestComponent,
    CsvDataSetsComponent,
    NewCsvDataSetComponent,
    CsvDataSetDetailComponent,
    GroupCsvTemplatesComponent,
    GroupDatabaseConflictsComponent,
    DownloadStatisticalFileComponent,
    GroupDevicePasswordPolicyComponent,
    GroupUploadsEditComponent
  ],
  providers: [GroupsService, FilesService, TangerineFormsService, GroupDevicesService, TangyFormService ],
})
export class GroupsModule { }
