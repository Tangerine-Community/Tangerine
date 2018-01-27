import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupsRoutingModule } from './groups-routing.module';

import { GroupsComponent}  from './groups.component';
import { GroupsService}  from './services/groups.service';
import { GroupComponent } from './group/group.component';
import { NewGroupComponent } from './new-group/new-group.component';
import { ReleaseApkComponent } from './release-apk/release-apk.component';
import { ReleasePwaComponent } from './release-pwa/release-pwa.component';


@NgModule({
  imports: [
    CommonModule,
    GroupsRoutingModule
  ],
  declarations: [GroupsComponent, GroupComponent, NewGroupComponent, ReleaseApkComponent, ReleasePwaComponent],
  providers: [GroupsService]
})
export class GroupsModule { }
