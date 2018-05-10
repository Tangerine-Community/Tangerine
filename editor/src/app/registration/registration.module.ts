
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { RegistrationRoutingModule } from './registration-routing.module';

import {ValidationModule} from '../validation/validation.module';

import { RegistrationFormComponent }  from './registration-form.component';
import { LoginFormComponent }  from './login-form.component';
import { ConfirmationComponent }  from './confirmation.component';
import { PasswordFormComponent }  from './password-form.component';
import { PasswordChangeFormComponent }  from './pwchange-form.component';
import { UsernameFormComponent }  from './username-form.component';
import { VerifyComponent }  from './verify.component';
import { RegistrationService } from './services/registration.service';
import { CountriesService } from './services/countries.service';
import { StatesService } from './services/states.service';
import {UtilsModule} from "../utils/utils.module";
import {ProfileService} from './services/profile.service';



@NgModule({
  imports: [
    CommonModule,
    RegistrationRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ValidationModule,
    UtilsModule
  ],
  declarations: [RegistrationFormComponent, LoginFormComponent, PasswordFormComponent, PasswordChangeFormComponent, 
    ConfirmationComponent, UsernameFormComponent, VerifyComponent],
  providers: [ RegistrationService, CountriesService, StatesService, ProfileService ],
})
export class RegistrationModule { }
