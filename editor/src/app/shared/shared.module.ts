import { UnsanitizeHtmlPipe } from './../pipes/unsanitize.pipe';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { AppConfigService } from "../shared/_services/app-config.service";
import { TangyLoadingComponent } from './_components/tangy-loading/tangy-loading.component';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [AppConfigService],
  exports: [TranslateModule, MatSnackBarModule, TangyLoadingComponent, UnsanitizeHtmlPipe],
  declarations: [TangyLoadingComponent, UnsanitizeHtmlPipe]
})
export class SharedModule { }
