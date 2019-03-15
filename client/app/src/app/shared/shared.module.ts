import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppConfigService } from '../shared/_services/app-config.service';

import {
  RedirectToDefaultRouteComponent,
} from './_components/redirect-to-default-route/redirect-to-default-route.component';
import { TangySvgLogoComponent } from './_components/tangy-svg-logo/tangy-svg-logo.component';
import { TruncateValuePipe } from './_pipes/truncate-value.pipe';
import { UnsanitizeHtmlPipe } from './_pipes/unsanitize-html.pipe';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  providers: [AppConfigService],
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
