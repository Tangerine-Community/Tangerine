import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatCardModule, MatListModule, MatInputModule, MatButtonModule, MatTabsModule, MatAutocompleteModule, MatSelectModule, MatChipsModule } from '@angular/material';
import { GroupComponent } from './group/group.component';
import { GroupsRoutingModule } from './groups-routing.module';
import { GroupsComponent } from './groups.component';
import { NewGroupComponent } from './new-group/new-group.component';
import { ReleaseApkComponent } from './release-apk/release-apk.component';
import { ReleasePwaComponent } from './release-pwa/release-pwa.component';
import { GroupsService } from './services/groups.service';
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



@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
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
    SharedModule
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
    ManageLocationListMetadataComponent
  ],
  providers: [GroupsService]
})
export class GroupsModule { }
