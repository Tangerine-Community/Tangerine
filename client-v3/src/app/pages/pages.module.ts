import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdButtonModule, MdCheckboxModule, MdInputModule, MdToolbarModule, MdSidenavModule } from '@angular/material';
import { NodeManagerModule } from '../node-manager/node-manager.module';
import { TangerineFormsModule } from '../tangerine-forms/tangerine-forms.module';


import { PagesRoutingModule } from './pages-routing.module';
import { DemoComponent } from './demo/demo.component';
import { Page1Component } from './page-1/page-1.component';
import { Page2Component } from './page-2/page-2.component';
import { Page3Component } from './page-3/page-3.component';
import { MyTangyFormComponent } from './my-tangy-form/my-tangy-form.component';
import { IndexComponent } from './index/index.component';

@NgModule({
  imports: [ BrowserModule ,  FormsModule ,  HttpModule ,  BrowserAnimationsModule ,  MdButtonModule, MdCheckboxModule, MdInputModule, MdToolbarModule, MdSidenavModule ,  NodeManagerModule ,  TangerineFormsModule , // [

    PagesRoutingModule
  ],
  declarations: [DemoComponent, Page1Component, Page2Component, Page3Component, MyTangyFormComponent, IndexComponent]
})
export class PagesModule { }
