import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppConfigService } from './_services/app-config.service';
import { AuthenticationService } from './_services/authentication.service';
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
    {provide: DEFAULT_USER_DOCS, useValue:[], multi: true},
    LoginGuard,
    SearchService,
    FormTypesService,
    CreateProfileGuardService
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
