import { NgTangyFormEditorModule } from './../ng-tangy-form-editor/ng-tangy-form-editor.module';
import { GroupFormsSyncComponent } from './group-forms-sync/group-forms-sync.component';
import { GroupFormsCsvComponent } from './group-forms-csv/group-forms-csv.component';
import { MatIconModule, MatMenuModule } from '@angular/material';
import { MatTableModule } from '@angular/material/table';
import { TangyFormService } from './../tangy-forms/tangy-form.service';
import { GroupDevicesService } from './services/group-devices.service';
import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  MatCardModule, MatListModule, MatInputModule, MatButtonModule, MatTabsModule,
  MatAutocompleteModule, MatSelectModule, MatChipsModule, MatGridListModule
} from '@angular/material';
import { MatTreeModule } from '@angular/material/tree';
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
import { GroupDetailsComponent } from './group-details/group-details.component';
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
import { GroupUploadsComponent } from './group-uploads/group-uploads.component';
import { GroupReleaseApkTestComponent } from './group-release-apk-test/group-release-apk-test.component';
import { GroupReleaseApkLiveComponent } from './group-release-apk-live/group-release-apk-live.component';
import { GroupReleasePwaTestComponent } from './group-release-pwa-test/group-release-pwa-test.component';
import { GroupReleasePwaLiveComponent } from './group-release-pwa-live/group-release-pwa-live.component';



@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
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
    MatGridListModule,
    SharedModule,
    NgTangyFormEditorModule
  ],
  declarations: [
    LocationListEditorComponent,
    GroupsComponent,
    GroupComponent,
    NewGroupComponent,
    ReleaseApkComponent,
    ReleasePwaComponent,
    GroupDetailsComponent,
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
    GroupDeviceUsersComponent,
    GroupUploadsComponent,
    GroupReleaseApkTestComponent,
    GroupReleaseApkLiveComponent,
    GroupReleasePwaTestComponent,
    GroupReleasePwaLiveComponent
  ],
  providers: [GroupsService, FilesService, TangerineFormsService, GroupDevicesService, TangyFormService ],
  entryComponents: [CopyFormComponent]
})
export class GroupsModule { }
