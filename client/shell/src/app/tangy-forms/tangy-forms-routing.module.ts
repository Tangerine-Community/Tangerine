import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';
const routes: Routes = [{
    path: 'tangy-forms',
    component: TangyFormsPlayerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TangyFormsRoutingModule { }
