import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';

const routes: Routes = [{
  path: 'tangy-form-player',
  component: TangyFormsPlayerComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TangyFormsRoutingModule { }
