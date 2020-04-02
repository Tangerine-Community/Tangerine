import { LoginGuard } from './_guards/login-guard.service';
import { ServerConfigService } from './_services/server-config.service';
import { UnsanitizeHtmlPipe } from './../pipes/unsanitize.pipe';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { AppConfigService } from "../shared/_services/app-config.service";
import { TangyLoadingComponent } from './_components/tangy-loading/tangy-loading.component';
import { BreadcrumbComponent } from './_components/breadcrumb/breadcrumb.component';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [AppConfigService, ServerConfigService, LoginGuard],
  exports: [TranslateModule, MatSnackBarModule, TangyLoadingComponent, BreadcrumbComponent, UnsanitizeHtmlPipe],
  declarations: [TangyLoadingComponent, UnsanitizeHtmlPipe, BreadcrumbComponent]
})
export class SharedModule { }
