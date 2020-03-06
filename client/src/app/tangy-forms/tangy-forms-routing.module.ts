import { NgModule, Injectable } from '@angular/core';
import { Observable } from 'rxjs'
import { RouterModule, Routes } from '@angular/router';
import { CreateProfileGuardService } from '../shared/_guards/create-profile-guard.service';

import { LoginGuard } from '../shared/_guards/login-guard.service';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';
import { _TRANSLATE } from '../shared/translation-marker';

import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'


/* @TODO This is breaking angular prod mode.
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
*/

const routes: Routes = [{
  path: 'tangy-forms-player',
  component: TangyFormsPlayerComponent,
  canActivate: [LoginGuard, CreateProfileGuardService],
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TangyFormsRoutingModule { }
