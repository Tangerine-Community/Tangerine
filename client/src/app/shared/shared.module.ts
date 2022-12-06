import { VariableService } from './_services/variable.service';
import { LockBoxService } from './_services/lock-box.service';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppConfigService } from './_services/app-config.service';
import { UserService } from './_services/user.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpClientLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/', '.json');
}

import {
  RedirectToDefaultRouteComponent,
} from './_components/redirect-to-default-route/redirect-to-default-route.component';
import { TangySvgLogoComponent } from './_components/tangy-svg-logo/tangy-svg-logo.component';
import { TruncateValuePipe } from './_pipes/truncate-value.pipe';
import { UnsanitizeHtmlPipe } from './_pipes/unsanitize-html.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginGuard } from './_guards/login-guard.service';
import { CreateProfileGuardService } from './_guards/create-profile-guard.service';
import { DEFAULT_USER_DOCS } from './_tokens/default-user-docs.token';
import { SearchService } from './_services/search.service';
import { FormTypesService } from './_services/form-types.service';
import { MatDialogModule } from '@angular/material/dialog';
import { ProcessMonitorDialogComponent } from './_components/process-monitor-dialog/process-monitor-dialog.component';
import { ProcessMonitorService } from './_services/process-monitor.service';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpClientLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    AppConfigService,
    UserService,
    LockBoxService,
    VariableService,
    {provide: DEFAULT_USER_DOCS, useValue:[], multi: true},
    LoginGuard,
    SearchService,
    FormTypesService,
    ProcessMonitorService,
    CreateProfileGuardService
  ],
  declarations: [
    UnsanitizeHtmlPipe,
    TangySvgLogoComponent,
    TruncateValuePipe,
    ProcessMonitorDialogComponent,
    RedirectToDefaultRouteComponent],

  exports: [RedirectToDefaultRouteComponent,
    UnsanitizeHtmlPipe,
    TangySvgLogoComponent,
    TruncateValuePipe, TranslateModule]
})
export class SharedModule { }
