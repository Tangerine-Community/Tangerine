import { CaseModule } from './case/case.module';
import { UnsanitizeHtmlPipe } from './pipes/unsanitize.pipe';
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
import { httpInterceptorProviders } from './core/http/interceptors';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import './core/loading-ui.component'
import { NgxPermissionsModule } from 'ngx-permissions';
import { RouterModule } from '@angular/router';
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/', '.json');
}
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AppComponent, SupportComponent],
  imports: [
    RouterModule,
    MatToolbarModule,
    MatDividerModule,
    MatSidenavModule,
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
    CaseModule,
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
    NgxPermissionsModule.forRoot(),
    BrowserAnimationsModule
  ],
  providers: [httpInterceptorProviders, TangyErrorHandler,
    WindowRef, { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
