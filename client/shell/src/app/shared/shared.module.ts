import { SeamlessWithWindowDirective } from './seamless-with-window.directive';
import { SafeUrlPipe } from '../tangy-forms/safe-url.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TangySvgLogoComponent } from './tangy-svg-logo/tangy-svg-logo.component';
import { TruncateStringPipe } from './truncate-string.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [SafeUrlPipe, SeamlessWithWindowDirective, TangySvgLogoComponent, TruncateStringPipe],
  exports: [SafeUrlPipe, SeamlessWithWindowDirective, TangySvgLogoComponent, TruncateStringPipe]
})
export class SharedModule { }
