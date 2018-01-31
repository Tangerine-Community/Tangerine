import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent}  from './home.component';

import {UsageService} from './home.service';
import {RegistrationService} from '../registration/services/registration.service';


@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
  ],
  declarations: [HomeComponent],
  providers: [
     UsageService
  ],
})
export class HomeModule { }
