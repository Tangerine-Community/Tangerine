import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { MdInputModule, MdButtonModule, MdListModule, MdSelectModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { RegistrationComponent } from './registration/registration.component';
import { TangerineFormsModule } from '../../tangerine-forms/tangerine-forms.module';
import { LoginGuard } from './_guards/login-guard.service';
import { AuthenticationService } from './_services/authentication.service';
import { UserService } from './_services/user.service';
import { LoginRemoteServerComponent } from './login-remote-server/login-remote-server.component';
import { RegisterRemoteServerComponent } from './register-remote-server/register-remote-server.component';
// @TODO Add edit-profile component.
// import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { FormlyModule } from 'ng-formly';
@NgModule({
  imports: [
    CommonModule,
    MdInputModule,
    MdButtonModule,
    MdSelectModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    TangerineFormsModule,
    AuthRoutingModule,
    FormlyModule.forRoot()
  ],
  providers: [LoginGuard, AuthenticationService, UserService],
  // @TODO Add edit-profile component.
  declarations: [LoginComponent, RegistrationComponent, LoginRemoteServerComponent, RegisterRemoteServerComponent]
})
export class AuthModule { }
