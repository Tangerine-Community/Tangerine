
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';//not sure if this is needed
import {ApplicationInitStatus, ApplicationRef, NgModule} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import 'rxjs/add/operator/map'; //added so we could use map in services as needed to avoid red squigglies
import 'rxjs/add/operator/mergeMap'; 
//import 'rxjs/add/operator/toPromise';

//import { UUID } from 'angular2-uuid';

//import { ValidationService } from './validation/validation.service';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { SupportComponent } from './support/support.component';
import { RegistrationModule } from './registration/registration.module';
import { BillingModule } from './billing/billing.module';
//import { RegistrationService } from './registration/services/registration.service';
//import { BillingService } from './billing/services/billing.service';
//import { PaypalService } from './registration/services/paypal.service';
import { HomeModule } from './home/home.module';
import { GroupsModule } from './groups/groups.module';
import { AuthGuard } from './auth-guard.service';
import { AuthService } from './auth.service';
import { JsonpModule } from '@angular/http';
import {ProfileModule} from "./profile/profile.module";
import {MdlModule} from "angular2-mdl";


//import {ControlMessages} from './validation/validation.component';//third party component for validation

@NgModule({
  declarations: [
    AppComponent,
    SupportComponent
  ],
  imports: [
    AppRoutingModule,
    RegistrationModule,
    ProfileModule,
    BillingModule,
    HomeModule,
    GroupsModule,
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    MdlModule
  ],
  providers: [ AuthGuard, AuthService  ],//BillingService, PaypalService, //I think BillingService and PayPal service should be moved out of here as declared in sub modules (jw note)
  bootstrap: [AppComponent]
})
export class AppModule {

  // constructor(private appRef: ApplicationRef, private appStatus: ApplicationInitStatus) { }
  //
  // public ngDoBootstrap() {
  //   this.appStatus.donePromise.then( () => {
  //     let script = document.createElement('script');
  //     script.innerHTML = '';
  //     script.src = 'https://buttons.github.io/buttons.js';
  //     let anyScriptTag = document.getElementsByTagName('script')[0];
  //     anyScriptTag.parentNode.insertBefore(script, anyScriptTag);
  //   });
  //   this.appRef.bootstrap(AppModule);
  // }


}
