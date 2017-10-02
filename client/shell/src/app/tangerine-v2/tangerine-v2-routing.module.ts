import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TangerineV2PlayerComponent } from './tangerine-v2-player/tangerine-v2-player.component'

const routes: Routes = [{
    path: 'tangerine-v2-player',
    component: TangerineV2PlayerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TangerineV2RoutingModule { }
