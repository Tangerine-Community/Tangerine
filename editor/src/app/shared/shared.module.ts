import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule
  ],
  exports: [TranslateModule, MatSnackBarModule]
})
export class SharedModule { }
