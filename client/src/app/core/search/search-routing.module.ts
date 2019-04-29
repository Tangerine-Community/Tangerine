import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchComponent } from './search.component';
import { LoginGuard } from 'src/app/shared/_guards/login-guard.service';
import { CreateProfileGuardService } from 'src/app/shared/_guards/create-profile-guard.service';

const routes: Routes = [{
  path: 'search',
  component: SearchComponent,
  canActivate: [LoginGuard, CreateProfileGuardService]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchRoutingModule { }
