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
  MATERIAL_COMPATIBILITY_MODE
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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

// import { CaseManagementModule } from './case-management/case-management.module';
export { AppComponent }

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    MatButtonModule, MatCheckboxModule, MatInputModule, MatToolbarModule, MatSidenavModule, MatMenuModule,
    UuidModule,
    TangyFormsModule,
    AuthModule,
    CaseManagementModule,
    UserProfileModule,
    UpdateModule,
    SyncRecordsModule,
    AppRoutingModule,
    SharedModule
  ],
  providers: [WindowRef,
    Loc, { provide: MATERIAL_COMPATIBILITY_MODE, useValue: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
