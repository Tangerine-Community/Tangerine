import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatListModule } from '@angular/material';

import { SharedModule } from '../shared/shared.module';
import { CreateProfileGuardService } from './create-profile-guard.service';
import { UserProfileRoutingModule } from './user-profile-routing.module';
import { UserProfileComponent } from './user-profile.component';

@NgModule({
  providers: [CreateProfileGuardService],
  imports: [
    CommonModule,
    UserProfileRoutingModule,
    MatListModule,
    SharedModule

  ],
  declarations: [UserProfileComponent]
})
export class UserProfileModule { }
