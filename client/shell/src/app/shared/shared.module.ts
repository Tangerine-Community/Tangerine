import { SeamlessWithWindowDirective } from './seamless-with-window.directive';
import { SafeUrlPipe } from '../tangy-forms/safe-url.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TangySvgLogoComponent } from './tangy-svg-logo/tangy-svg-logo.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [SafeUrlPipe, SeamlessWithWindowDirective, TangySvgLogoComponent],
  exports: [SafeUrlPipe, SeamlessWithWindowDirective, TangySvgLogoComponent]
})
export class SharedModule { }
