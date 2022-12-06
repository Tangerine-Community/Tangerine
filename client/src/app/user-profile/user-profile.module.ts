import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatListModule } from '@angular/material/list';

import { SharedModule } from '../shared/shared.module';
import { UserProfileRoutingModule } from './user-profile-routing.module';
import { UserProfileComponent } from './user-profile.component';
import { ImportUserProfileComponent } from './import-user-profile/import-user-profile.component';
import { AssociateUserProfileComponent } from './associate-user-profile/associate-user-profile.component';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
  imports: [
    CommonModule,
    UserProfileRoutingModule,
    MatListModule,
    SharedModule

  ],
  declarations: [UserProfileComponent, ImportUserProfileComponent, AssociateUserProfileComponent]
})
export class UserProfileModule { }
