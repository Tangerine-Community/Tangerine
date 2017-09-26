import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TangerineV2RoutingModule } from './tangerine-v2-routing.module';
import { TangerineV2PlayerComponent } from './tangerine-v2-player/tangerine-v2-player.component';

@NgModule({
  imports: [
    CommonModule,
    TangerineV2RoutingModule
  ],
  declarations: [TangerineV2PlayerComponent]
})
export class TangerineV2Module { }
