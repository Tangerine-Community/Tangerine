import { NgModule, Injectable } from '@angular/core';
import { Observable } from 'rxjs'
import { RouterModule, Routes } from '@angular/router';
import { CreateProfileGuardService } from '../user-profile/create-profile-guard.service';

import { LoginGuard } from '../core/auth/_guards/login-guard.service';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';
import { _TRANSLATE } from '../shared/translation-marker';

import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'


@Injectable()
class CanDeactivateForm implements CanDeactivate<TangyFormsPlayerComponent> {
  constructor() {}
  canDeactivate(
    component: TangyFormsPlayerComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): Observable<boolean>|Promise<boolean>|boolean {
    return confirm(_TRANSLATE('Are you sure you would like to exit the form?'))
  }
}

const routes: Routes = [{
  path: 'tangy-forms-player',
  component: TangyFormsPlayerComponent,
  canActivate: [LoginGuard, CreateProfileGuardService],
  canDeactivate: [ CanDeactivateForm ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CanDeactivateForm]
})
export class TangyFormsRoutingModule { }
