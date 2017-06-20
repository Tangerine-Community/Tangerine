import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdButtonModule, MdInputModule, MdGridListModule, MdListModule, MdCardModule, MdSelectModule, MdSlideToggleModule } from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NodeCreatorComponent } from './node-creator/node-creator.component';
import { NodeManagerRoutingModule } from './node-manager-routing.module';
import { LocationsCreatorComponent } from './locations-creator/locations-creator.component';
import {FormlyBootstrapModule, FormlyModule} from "ng-formly";
import {GroupManagerComponent} from "./group-manager/group-manager.component";
import {TangerinePageComponent} from "../tangerine-forms/tangerine-page/tangerine-page.component";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule.forRoot(),
    FormlyBootstrapModule,
    BrowserAnimationsModule, MdButtonModule, MdInputModule, MdGridListModule, MdListModule, MdCardModule, FormsModule, BrowserModule,
    MdButtonModule, MdSelectModule, MdSlideToggleModule, NodeManagerRoutingModule
  ],
  declarations: [NodeCreatorComponent, LocationsCreatorComponent, GroupManagerComponent, TangerinePageComponent],
  exports: [NodeCreatorComponent ]
})
export class NodeManagerModule { }
