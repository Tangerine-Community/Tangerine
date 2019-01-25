import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';
import { AdminUserGuard } from '../core/auth/_guards/admin-user-guard.service';

const routes: Routes = [{
  path: 'tangy-form-player',
  component: TangyFormsPlayerComponent,
  canActivate: [AdminUserGuard]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TangyFormsRoutingModule { }
