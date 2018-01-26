import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupsRoutingModule } from './groups-routing.module';

import { GroupsComponent}  from './groups.component';
import { GroupsService}  from './services/groups.service';


@NgModule({
  imports: [
    CommonModule,
    GroupsRoutingModule
  ],
  declarations: [GroupsComponent],
  providers: [GroupsService]
})
export class GroupsModule { }
