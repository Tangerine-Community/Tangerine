import { TangyFormsPlayerRouteComponent } from './tangy-forms-player-route/tangy-forms-player-route.component';
import { NgModule, Injectable } from '@angular/core';
import { Observable } from 'rxjs'
import { RouterModule, Routes } from '@angular/router';
import { CreateProfileGuardService } from '../shared/_guards/create-profile-guard.service';

import { LoginGuard } from '../shared/_guards/login-guard.service';
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
    if (component.isDirty()) {
      return confirm(_TRANSLATE('There is unsaved data. Are you sure you would like to exit the form?'));
    } else if (!component.isComplete()) {
      return confirm(_TRANSLATE('The form is not yet complete. Are you sure you would like to exit the form?'));
    } else {
      return true;
    }
  }
}

const routes: Routes = [
  {
    path: 'tangy-forms/resume/:formResponseId',
    component: TangyFormsPlayerRouteComponent,
    canActivate: [LoginGuard, CreateProfileGuardService],
    canDeactivate: [ CanDeactivateForm ]
  },
  {
    path: 'tangy-forms/new/:formId',
    component: TangyFormsPlayerRouteComponent,
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
