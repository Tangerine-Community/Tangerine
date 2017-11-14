import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';
import { LoginGuard } from '../core/auth/_guards/login-guard.service';
const routes: Routes = [{
  path: 'tangy-forms-player',
  component: TangyFormsPlayerComponent,
  canActivate: [LoginGuard]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TangyFormsRoutingModule { }
