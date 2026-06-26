import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpClientLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/', '.json');
}

@NgModule({ schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [],
    exports: [TranslateModule], imports: [CommonModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpClientLoaderFactory,
                deps: [HttpClient]
            }
        })], providers: [
        provideHttpClient(withXhr(), withInterceptorsFromDi())
    ] })
  export class SharedModule { }
  