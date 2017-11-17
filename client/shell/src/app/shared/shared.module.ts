import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SafeUrlPipe } from '../tangy-forms/safe-url.pipe';
import { SeamlessWithWindowDirective } from './seamless-with-window.directive';
import { TangySvgLogoComponent } from './tangy-svg-logo/tangy-svg-logo.component';
import { TangyTooltipComponent } from './tangy-tooltip/tangy-tooltip.component';
import { TruncateValuePipe } from './truncate-value.pipe';

@NgModule({
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  declarations: [SafeUrlPipe, SeamlessWithWindowDirective, TangySvgLogoComponent, TruncateValuePipe, TangyTooltipComponent],
  exports: [SafeUrlPipe, SeamlessWithWindowDirective, TangySvgLogoComponent, TruncateValuePipe, TangyTooltipComponent]
})
export class SharedModule { }
