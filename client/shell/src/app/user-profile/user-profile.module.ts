import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MdListModule } from '@angular/material';

import { UserProfileRoutingModule } from './user-profile-routing.module';
import { UserProfileComponent } from './user-profile.component';
import { ManageMySchoolsListComponent } from './manage-my-schools-list/manage-my-schools-list.component';

@NgModule({
  imports: [
    CommonModule,
    UserProfileRoutingModule,
    MdListModule
  ],
  declarations: [UserProfileComponent, ManageMySchoolsListComponent]
})
export class UserProfileModule { }
