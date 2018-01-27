import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupsRoutingModule } from './groups-routing.module';

import { GroupsComponent}  from './groups.component';
import { GroupsService}  from './services/groups.service';
import { GroupComponent } from './group/group.component';
import { NewGroupComponent } from './new-group/new-group.component';


@NgModule({
  imports: [
    CommonModule,
    GroupsRoutingModule
  ],
  declarations: [GroupsComponent, GroupComponent, NewGroupComponent],
  providers: [GroupsService]
})
export class GroupsModule { }
