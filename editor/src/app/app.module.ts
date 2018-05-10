
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';//not sure if this is needed
import {ApplicationInitStatus, ApplicationRef, NgModule} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import 'rxjs/add/operator/map'; //added so we could use map in services as needed to avoid red squigglies
import 'rxjs/add/operator/mergeMap'; 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SupportComponent } from './support/support.component';
import { RegistrationModule } from './registration/registration.module';
import { GroupsModule } from './groups/groups.module';
import { AuthGuard } from './auth-guard.service';
import { AuthService } from './auth.service';
import { JsonpModule } from '@angular/http';
import {ProfileModule} from "./profile/profile.module";
import {MdlModule} from "angular2-mdl";

@NgModule({
  declarations: [
    AppComponent,
    SupportComponent
  ],
  imports: [
    AppRoutingModule,
    RegistrationModule,
    ProfileModule,
    GroupsModule,
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    MdlModule
  ],
  providers: [ AuthGuard, AuthService  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
