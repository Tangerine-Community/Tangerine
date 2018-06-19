import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, Routes, RouterModule } from '@angular/router';
import { LoginGuard } from '../core/auth/_guards/login-guard.service';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';
const routes: Routes = [{
  path: 'tangy-forms-player',
  component: TangyFormsPlayerComponent,
  canActivate: [LoginGuard]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class TangyFormsRoutingModule { }
