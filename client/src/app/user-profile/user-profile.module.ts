import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatListModule } from '@angular/material';

import { SharedModule } from '../shared/shared.module';
import { CreateProfileGuardService } from './create-profile-guard.service';
import { UserProfileRoutingModule } from './user-profile-routing.module';
import { UserProfileComponent } from './user-profile.component';
import { ImportUserProfileComponent } from './import-user-profile/import-user-profile.component';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [CreateProfileGuardService],
  imports: [
    CommonModule,
    UserProfileRoutingModule,
    MatListModule,
    SharedModule

  ],
  declarations: [UserProfileComponent, ImportUserProfileComponent]
})
export class UserProfileModule { }
