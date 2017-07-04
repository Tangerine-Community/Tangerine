import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdButtonModule, MdCheckboxModule, MdInputModule, MdToolbarModule, MdSidenavModule } from '@angular/material';
import 'hammerjs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NgBinderModule } from './ng-binder/ng-binder.module';
import { NodeManagerModule } from './node-manager/node-manager.module';
import { TangerineFormsModule } from './tangerine-forms/tangerine-forms.module';
import { MyTangyFormComponent } from './pages/my-tangy-form/my-tangy-form.component';
import { IndexComponent } from './pages/index/index.component';

export { AppComponent }

@NgModule({
  declarations: [
    AppComponent,
    MyTangyFormComponent,
    IndexComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    MdButtonModule, MdCheckboxModule, MdInputModule, MdToolbarModule, MdSidenavModule,
    NgBinderModule,
    TangerineFormsModule,
    NodeManagerModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
