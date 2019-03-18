import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppConfigService } from '../shared/_services/app-config.service';
import { AuthenticationService } from './_services/authentication.service';
import { UserService } from './_services/user.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Loc } from './_services/location.service';
import { WindowRef } from './_services/window-ref.service';

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

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatTooltipModule,
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
    AuthenticationService,
    UserService,
    WindowRef,
    Loc,
    LoginGuard
  ],
  declarations: [
    UnsanitizeHtmlPipe,
    TangySvgLogoComponent,
    TruncateValuePipe,
    RedirectToDefaultRouteComponent],

  exports: [RedirectToDefaultRouteComponent,
    UnsanitizeHtmlPipe,
    TangySvgLogoComponent,
    TruncateValuePipe, TranslateModule]
})
export class SharedModule { }
