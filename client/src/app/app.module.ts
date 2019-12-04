import { SyncModule } from './sync/sync.module';
import { DeviceModule } from './device/device.module';
import { SharedModule } from './shared/shared.module';
import 'hammerjs';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatInputModule,
  MatMenuModule,
  MatSidenavModule,
  MatToolbarModule,
  MatIconModule,
  MatProgressBarModule
} from '@angular/material';
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
import { ClassModule } from "./class/class.module";
import { AboutModule } from './core/about/about.module';
import { TwoWaySyncModule } from './two-way-sync/two-way-sync.module';
import { SearchModule } from './core/search/search.module';
import { NewFormResponseModule } from './core/new-form-response/new-form-response.module';
export { AppComponent }


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
    SyncModule,
    TwoWaySyncModule,
    NewFormResponseModule,
    UserProfileModule,
    SettingsModule,
    AboutModule,
    UpdateModule,
    SyncRecordsModule,
    ExportDataModule,
    AppRoutingModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
