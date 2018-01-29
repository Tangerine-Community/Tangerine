import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { BillingRoutingModule } from './billing-routing.module';

import {ValidationModule} from '../validation/validation.module';

import { BillsComponent }  from './billing.component';
import {BillingService} from "./services/billing.service";
import {UtilsModule} from "../utils/utils.module";
import {MdlModule} from "angular2-mdl";


@NgModule({
    imports: [
        CommonModule,
        BillingRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        ValidationModule,
        UtilsModule,
        MdlModule

    ],
    declarations: [BillsComponent],
    providers: [ BillingService ],
})
export class BillingModule { }
