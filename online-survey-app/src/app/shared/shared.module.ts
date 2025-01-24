import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpClientLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/', '.json');
}

@NgModule({
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    imports: [
      CommonModule,
      HttpClientModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpClientLoaderFactory,
          deps: [HttpClient]
        }
      })
    ],
    providers: [
    ],
    declarations: [
    ],
    exports: [TranslateModule]
  })
  export class SharedModule { }
  