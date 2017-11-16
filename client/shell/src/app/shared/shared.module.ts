import { SeamlessWithWindowDirective } from './seamless-with-window.directive';
import { SafeUrlPipe } from '../tangy-forms/safe-url.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TangySvgLogoComponent } from './tangy-svg-logo/tangy-svg-logo.component';
import { TruncateValuePipe } from './truncate-value.pipe';
import { TangyTooltipComponent } from './tangy-tooltip/tangy-tooltip.component';
import { MatTooltipModule } from '@angular/material/tooltip';
@NgModule({
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  declarations: [SafeUrlPipe, SeamlessWithWindowDirective, TangySvgLogoComponent, TruncateValuePipe, TangyTooltipComponent],
  exports: [SafeUrlPipe, SeamlessWithWindowDirective, TangySvgLogoComponent, TruncateValuePipe, TangyTooltipComponent]
})
export class SharedModule { }
