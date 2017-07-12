import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdButtonModule, MdCheckboxModule, MdInputModule } from '@angular/material';

import { FormlyModule, FormlyBootstrapModule } from 'ng-formly';
import 'hammerjs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NgBinderModule } from './ng-binder/ng-binder.module';
import { NodeManagerModule } from './node-manager/node-manager.module';
import { AuthModule } from './core/auth/auth.module';

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
    MdButtonModule, MdCheckboxModule, MdInputModule,
    NgBinderModule,
    ReactiveFormsModule,
    FormlyModule.forRoot(),
    FormlyBootstrapModule,
    NodeManagerModule,
    AuthModule,
    AppRoutingModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
