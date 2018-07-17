import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MdlModule } from 'angular2-mdl';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './core/auth/auth.module';
import { WindowRef } from './core/window-ref.service';
import { GroupsModule } from './groups/groups.module';
import { NgTangyFormEditorModule } from './ng-tangy-form-editor/ng-tangy-form-editor.module';
import { ProfileModule } from './profile/profile.module';
import { RegistrationModule } from './registration/registration.module';
import { SharedModule } from './shared/shared.module';
import { RequestInterceptor } from './shared/_services/request-interceptor.service';
import { TangyErrorHandler } from './shared/_services/tangy-error-handler.service';
import { SupportComponent } from './support/support.component';
import { WindowRef } from './core/window-ref.service';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, '../client/content/', '.json');
}
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AppComponent, SupportComponent],
  imports: [
    AppRoutingModule,
    AuthModule,
    ProfileModule,
    GroupsModule,
    BrowserModule,
    NgTangyFormEditorModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    JsonpModule,
    MdlModule,
    RegistrationModule, // @TODO remove as soon as we have refactored all hub specific functionality. All Registration and Login will be in Auth Module
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [TangyErrorHandler, WindowRef, { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
