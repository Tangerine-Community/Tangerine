import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdButtonModule, MdInputModule, MdGridListModule, MdListModule, MdCardModule, MdSelectModule, MdSlideToggleModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CovalentStepsModule } from '@covalent/core';
import { CovalentDynamicFormsModule } from '@covalent/dynamic-forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CovalentCommonModule, CovalentLayoutModule } from '@covalent/core';
import { NodeCreatorComponent } from './node-creator/node-creator.component';
import { NodeManagerRoutingModule } from './node-manager-routing.module';
import { LocationsCreatorComponent } from './locations-creator/locations-creator.component';

@NgModule({
  imports: [
    CommonModule,
    CovalentCommonModule,
    CovalentLayoutModule,
    BrowserAnimationsModule, MdButtonModule, MdInputModule, MdGridListModule, MdListModule, MdCardModule, FormsModule, BrowserModule,
    CovalentDynamicFormsModule, MdButtonModule, MdSelectModule, CovalentStepsModule, MdSlideToggleModule, NodeManagerRoutingModule

  ],
  declarations: [NodeCreatorComponent, LocationsCreatorComponent],
  exports: [NodeCreatorComponent]
})
export class NodeManagerModule { }
