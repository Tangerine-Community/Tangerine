import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import {FormlyModule, FormlyBootstrapModule} from 'ng-formly';

import { NgBinderModule } from './ng-binder/ng-binder.module';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ReactiveFormsModule,
    FormlyModule.forRoot(),
    FormlyBootstrapModule,
    NgBinderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
