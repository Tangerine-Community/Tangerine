import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import {AppConfigService} from "app/shared/_services/app-config.service";

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [AppConfigService],
  exports: [TranslateModule, MatSnackBarModule]
})
export class SharedModule { }
