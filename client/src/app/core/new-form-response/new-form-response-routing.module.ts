import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewFormResponseComponent } from './new-form-response.component';
import { LoginGuard } from 'src/app/shared/_guards/login-guard.service';
import { CreateProfileGuardService } from 'src/app/shared/_guards/create-profile-guard.service';

const routes: Routes = [
  {
    path: 'new-form-response',
    component: NewFormResponseComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewFormResponseRoutingModule { }
