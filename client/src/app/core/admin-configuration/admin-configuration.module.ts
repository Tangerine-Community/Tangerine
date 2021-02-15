import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminConfigurationRoutingModule } from './admin-configuration-routing.module';
import { AdminConfigurationComponent } from './admin-configuration/admin-configuration.component';
import {SharedModule} from "../../shared/shared.module";
import {HttpClientModule} from "@angular/common/http";
import {SyncModule} from "../../sync/sync.module";


@NgModule({
  imports: [
    CommonModule,
    AdminConfigurationRoutingModule,
    SharedModule,
    SyncModule
  ],
  declarations: [AdminConfigurationComponent],
  providers: [HttpClientModule],

})
export class AdminConfigurationModule { }
