import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupManagerComponent } from './group-manager.component';
import { NodeManagerModule } from '../node-manager.module';

@NgModule({
  imports: [
    CommonModule,
    NodeManagerModule
  ]
})
export class GroupManagerModule { }
