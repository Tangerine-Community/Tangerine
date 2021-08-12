import { AppDocs } from './app.docs';
import { DEFAULT_USER_DOCS } from './shared/_tokens/default-user-docs.token';
import { CaseHomeModule } from './case-home/case-home.module';
import { SyncModule } from './sync/sync.module';
import { DeviceModule } from './device/device.module';
import { SharedModule } from './shared/shared.module';
import {NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CaseManagementModule } from './case-management/case-management.module';
import { CaseModule } from './case/case.module';
import { AuthModule } from './core/auth/auth.module';
import { SyncRecordsModule } from './core/sync-records/sync-records.module';
import { UpdateModule } from './core/update/update.module';
import { SettingsModule } from './core/settings/settings.module';
import { TangyFormsModule } from './tangy-forms/tangy-forms.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { ExportDataModule } from './core/export-data/export-data.module';
import { ClassModule } from './class/class.module';
import { AboutModule } from './core/about/about.module';
import { SearchModule } from './core/search/search.module';
import { NewFormResponseModule } from './core/new-form-response/new-form-response.module';
import './core/loading-ui.component'
import {AppInit} from './app-init';
import {AdminConfigurationModule} from "./core/admin-configuration/admin-configuration.module";
export { AppComponent }


export function initializeApp1(appInit: AppInit) {
  return (): Promise<any> => {
    return appInit.Init();
  }
}

@NgModule({
  declarations: [
    AppComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule, MatIconModule, MatCheckboxModule, MatInputModule, MatToolbarModule, MatSidenavModule, MatMenuModule, MatProgressBarModule,
    TangyFormsModule,
    AuthModule,
    CaseManagementModule,
    ClassModule,
    DeviceModule,
    SearchModule,
    CaseModule,
    CaseHomeModule,
    SyncModule,
    NewFormResponseModule,
    UserProfileModule,
    SettingsModule,
    AboutModule,
    UpdateModule,
    SyncRecordsModule,
    AdminConfigurationModule,
    ExportDataModule,
    // Make sure any new modules with route are placed above AppRoutingModule.
    AppRoutingModule,
    SharedModule
  ],
  providers: [AppInit,
    { provide: APP_INITIALIZER, useFactory: initializeApp1, deps: [AppInit], multi: true},
    {
      provide: DEFAULT_USER_DOCS,
      useValue: AppDocs,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
