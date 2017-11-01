import { SafeUrlPipe } from './tangy-forms/safe-url.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [SafeUrlPipe],
  exports: [SafeUrlPipe]
})
export class SharedModule { }
