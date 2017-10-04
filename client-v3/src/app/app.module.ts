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

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CaseManagementModule } from './case-management/case-management.module';
import { AuthModule } from './core/auth/auth.module';
import { ChooseUserProfileComponent } from './core/auth/choose-user-profile/choose-user-profile.component';
import { SyncRecordsModule } from './core/sync-records/sync-records.module';
import { WindowRef } from './core/window-ref.service';
import { NodeManagerModule } from './node-manager/node-manager.module';
import { TangerineFormsModule } from './tangerine-forms/tangerine-forms.module';

export { AppComponent }

@NgModule({
  declarations: [
    AppComponent, ChooseUserProfileComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    MdButtonModule, MdCheckboxModule, MdInputModule, MdToolbarModule, MdSidenavModule, MdMenuModule,
    TangerineFormsModule,
    AuthModule,
    SyncRecordsModule,
    NodeManagerModule,
    AppRoutingModule,
    CaseManagementModule
  ],
  providers: [WindowRef],
  bootstrap: [AppComponent]
})
export class AppModule { }
