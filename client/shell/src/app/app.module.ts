import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdButtonModule, MdCheckboxModule, MdInputModule, MdToolbarModule, MdSidenavModule } from '@angular/material';
import 'hammerjs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WindowRef } from './core/window-ref.service';

import { NodeManagerModule } from './node-manager/node-manager.module';
import { TangerineFormsModule } from './tangerine-forms/tangerine-forms.module';
import { TangerineV2Module } from './tangerine-v2/tangerine-v2.module';
import { AuthModule } from './core/auth/auth.module';

import { SyncRecordsModule } from './core/sync-records/sync-records.module';

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
    MdButtonModule, MdCheckboxModule, MdInputModule, MdToolbarModule, MdSidenavModule,
    TangerineFormsModule,
    TangerineV2Module,
    AuthModule,
    SyncRecordsModule,
    NodeManagerModule,
    AppRoutingModule
  ],
  providers: [WindowRef],
  bootstrap: [AppComponent]
})
export class AppModule { }
