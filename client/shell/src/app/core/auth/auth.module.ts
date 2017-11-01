import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdButtonModule, MdInputModule, MdSelectModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LoginGuard } from './_guards/login-guard.service';
import { AuthenticationService } from './_services/authentication.service';
import { UserService } from './_services/user.service';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginRemoteServerComponent } from './login-remote-server/login-remote-server.component';
import { LoginComponent } from './login/login.component';
import { RegisterRemoteServerComponent } from './register-remote-server/register-remote-server.component';
import { RegistrationComponent } from './registration/registration.component';

// @TODO Add edit-profile component.
// import { EditProfileComponent } from './edit-profile/edit-profile.component';
@NgModule({
  imports: [
    CommonModule,
    MdInputModule,
    MdButtonModule,
    MdSelectModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AuthRoutingModule
  ],
  providers: [LoginGuard, AuthenticationService, UserService],
  // @TODO Add edit-profile component.
  declarations: [LoginComponent, RegistrationComponent, LoginRemoteServerComponent, RegisterRemoteServerComponent]
})
export class AuthModule { }
