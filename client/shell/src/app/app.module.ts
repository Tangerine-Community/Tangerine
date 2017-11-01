import 'hammerjs';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {
  MdButtonModule,
  MdCheckboxModule,
  MdInputModule,
  MdMenuModule,
  MdSidenavModule,
  MdToolbarModule,
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
import { NodeManagerModule } from './node-manager/node-manager.module';
import { TangerineFormsModule } from './tangerine-forms/tangerine-forms.module';
import { TangerineV2Module } from './tangerine-v2/tangerine-v2.module';
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
    MdButtonModule, MdCheckboxModule, MdInputModule, MdToolbarModule, MdSidenavModule, MdMenuModule,
    UuidModule,
    TangerineFormsModule,
    TangerineV2Module,
    TangyFormsModule,
    AuthModule,
    CaseManagementModule,
    UserProfileModule,
    SyncRecordsModule,
    NodeManagerModule,
    AppRoutingModule
  ],
  providers: [WindowRef],
  bootstrap: [AppComponent]
})
export class AppModule { }
