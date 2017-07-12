import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdButtonModule, MdInputModule, MdGridListModule, MdListModule, MdCardModule, MdSelectModule, MdSlideToggleModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NodeCreatorComponent } from './node-creator/node-creator.component';
import { NodeManagerRoutingModule } from './node-manager-routing.module';
import { LocationsCreatorComponent } from './locations-creator/locations-creator.component';
import { GroupManagerModule } from './group-manager/group-manager.module';
import {GroupManagerComponent} from "./group-manager/group-manager.component";
import {TangerineFormsModule} from "../tangerine-forms/tangerine-forms.module";

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule, MdButtonModule, MdInputModule, MdGridListModule, MdListModule, MdCardModule, FormsModule, BrowserModule,
    MdButtonModule, MdSelectModule, MdSlideToggleModule, NodeManagerRoutingModule, TangerineFormsModule
    // , GroupManagerModule
  ],
  declarations: [NodeCreatorComponent, LocationsCreatorComponent, GroupManagerComponent],
  exports: [NodeCreatorComponent]
})
export class NodeManagerModule { }
