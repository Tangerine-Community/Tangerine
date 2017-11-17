import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateProfileGuardService } from 'app/user-profile/create-profile-guard.service';

import { LoginGuard } from '../core/auth/_guards/login-guard.service';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';

const routes: Routes = [{
  path: 'tangy-forms-player',
  component: TangyFormsPlayerComponent,
  canActivate: [LoginGuard, CreateProfileGuardService]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TangyFormsRoutingModule { }
