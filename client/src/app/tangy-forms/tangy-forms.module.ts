import { SharedModule } from '../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TangyFormsRoutingModule } from './tangy-forms-routing.module';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';
import { UserService } from '../shared/_services/user.service';
import { TangyFormsQueries } from './tangy-forms.queries';

@NgModule({
  imports: [
    CommonModule,
    TangyFormsRoutingModule,
    SharedModule
  ],
  declarations: [TangyFormsPlayerComponent]
})
export class TangyFormsModule {
  constructor(private userService: UserService) {
    userService.addViews('tangy-form', TangyFormsQueries)
  }
 }
