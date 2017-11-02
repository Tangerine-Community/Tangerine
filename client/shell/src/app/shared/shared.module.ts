import { SeamlessWithWindowDirective } from './seamless-with-window.directive';
import { SafeUrlPipe } from '../tangy-forms/safe-url.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [SafeUrlPipe, SeamlessWithWindowDirective],
  exports: [SafeUrlPipe, SeamlessWithWindowDirective]
})
export class SharedModule { }
