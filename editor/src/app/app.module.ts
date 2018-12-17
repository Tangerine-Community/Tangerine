import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './core/auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { NgTangyFormEditorModule } from './ng-tangy-form-editor/ng-tangy-form-editor.module';
import { ProfileModule } from './profile/profile.module';
import { RegistrationModule } from './registration/registration.module';
import { SharedModule } from './shared/shared.module';
import { RequestInterceptor } from './shared/_services/request-interceptor.service';
import { TangyErrorHandler } from './shared/_services/tangy-error-handler.service';
import { SupportComponent } from './support/support.component';
import { WindowRef } from './core/window-ref.service';
import { TangyFormsModule } from './tangy-forms/tangy-forms.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule, MatIconModule, MatCheckboxModule, MatCardModule, MatMenuModule} from '@angular/material';


export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/', '.json');
}
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AppComponent, SupportComponent],
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    AppRoutingModule,
    AuthModule,
    ProfileModule,
    GroupsModule,
    BrowserModule,
    TangyFormsModule,
    NgTangyFormEditorModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RegistrationModule, // @TODO remove as soon as we have refactored all hub specific functionality. All Registration and Login will be in Auth Module
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    BrowserAnimationsModule
  ],
  providers: [TangyErrorHandler, WindowRef, { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
