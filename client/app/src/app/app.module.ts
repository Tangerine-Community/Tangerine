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
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CaseManagementModule } from './case-management/case-management.module';
import { AuthModule } from './core/auth/auth.module';
import { SyncRecordsModule } from './core/sync-records/sync-records.module';
import { WindowRef } from './core/window-ref.service';
import { Loc } from './core/location.service';
import { UpdateModule } from './core/update/update.module';
import { TangyFormsModule } from './tangy-forms/tangy-forms.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { ExportDataModule } from './core/export-data/export-data.module';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// import { CaseManagementModule } from './case-management/case-management.module';
export { AppComponent }
export function HttpClientLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/', '.json');
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
    UserProfileModule,
    UpdateModule,
    SyncRecordsModule,
    ExportDataModule,
    AppRoutingModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpClientLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [WindowRef,
    Loc],
  bootstrap: [AppComponent]
})
export class AppModule { }
