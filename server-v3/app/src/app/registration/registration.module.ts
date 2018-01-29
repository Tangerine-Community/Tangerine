
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { RegistrationRoutingModule } from './registration-routing.module';

import {ValidationModule} from '../validation/validation.module';

import { RegistrationFormComponent }  from './registration-form.component';
import { LoginFormComponent }  from './login-form.component';
import { ConfirmationComponent }  from './confirmation.component';
import { PaypalConfirmationComponent }  from './paypal-confirmation.component';
import { PasswordFormComponent }  from './password-form.component';
import { PasswordChangeFormComponent }  from './pwchange-form.component';
import { UsernameFormComponent }  from './username-form.component';
import { PlanComponent }  from './plan.component';
import { VerifyComponent }  from './verify.component';
import { RegistrationService } from './services/registration.service';
//import { TruncatePipe } from '../pipes/truncate';
import { CountriesService } from './services/countries.service';
import { StatesService } from './services/states.service';
import { PaypalService } from './services/paypal.service';
import { CheckoutComponent }  from './checkout.component';
import {UtilsModule} from "../utils/utils.module";
import {ProfileService} from './services/profile.service';


//import {ValidationService} from '../validation.service';//not an injectable service
//import {ControlMessages} from '../validation.component';//third party component for validation


@NgModule({
  imports: [
    CommonModule,
    RegistrationRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ValidationModule,
    UtilsModule
  ],
  declarations: [RegistrationFormComponent, LoginFormComponent, ConfirmationComponent, PaypalConfirmationComponent, PasswordFormComponent, PasswordChangeFormComponent, 
    UsernameFormComponent, PlanComponent, VerifyComponent, CheckoutComponent],
  providers: [ RegistrationService, CountriesService, PaypalService, StatesService, ProfileService ],
})
export class RegistrationModule { }
