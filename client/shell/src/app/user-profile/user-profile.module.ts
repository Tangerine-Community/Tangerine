import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MdListModule } from '@angular/material';

import { UserProfileRoutingModule } from './user-profile-routing.module';
import { UserProfileComponent } from './user-profile.component';

@NgModule({
  imports: [
    CommonModule,
    UserProfileRoutingModule,
    MdListModule,
    SharedModule

  ],
  declarations: [UserProfileComponent]
})
export class UserProfileModule { }
