import { SharedModule } from './shared/shared.module';
import 'hammerjs';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatInputModule,
  MatMenuModule,
  MatSidenavModule,
  MatToolbarModule,
  MatProgressBarModule,
  MATERIAL_COMPATIBILITY_MODE
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { UuidModule } from 'ng2-uuid';
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
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// import { CaseManagementModule } from './case-management/case-management.module';
export { AppComponent }
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, '../content/', '.json');
}
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule, MatCheckboxModule, MatInputModule, MatToolbarModule, MatSidenavModule, MatMenuModule, MatProgressBarModule,
    UuidModule,
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
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [WindowRef,
    Loc, { provide: MATERIAL_COMPATIBILITY_MODE, useValue: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
