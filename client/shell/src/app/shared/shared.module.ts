import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppConfigService } from 'app/shared/_services/app-config.service';

import { SafeUrlPipe } from '../tangy-forms/safe-url.pipe';
import {
  RedirectToDefaultRouteComponent,
} from './_components/redirect-to-default-route/redirect-to-default-route.component';
import { TangySvgLogoComponent } from './_components/tangy-svg-logo/tangy-svg-logo.component';
import { SeamlessWithWindowDirective } from './_directives/seamless-with-window.directive';
import { TruncateValuePipe } from './_pipes/truncate-value.pipe';

@NgModule({
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  providers: [AppConfigService],
  declarations: [SafeUrlPipe,
    SeamlessWithWindowDirective, TangySvgLogoComponent,
    TruncateValuePipe,
    RedirectToDefaultRouteComponent],

  exports: [RedirectToDefaultRouteComponent, SafeUrlPipe,
    SeamlessWithWindowDirective, TangySvgLogoComponent,
    TruncateValuePipe]
})
export class SharedModule { }
