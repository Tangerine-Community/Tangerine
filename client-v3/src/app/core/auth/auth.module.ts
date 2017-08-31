import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { MdInputModule, MdButtonModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { RegistrationComponent } from './registration/registration.component';
import { TangerineFormsModule } from '../../tangerine-forms/tangerine-forms.module';
import { LoginGuard } from './_guards/login-guard.service';
import { AuthenticationService } from './_services/authentication.service';
import { UserService } from './_services/user.service';
import { LoginRemoteServerComponent } from './login-remote-server/login-remote-server.component';
import { RegisterRemoteServerComponent } from './register-remote-server/register-remote-server.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
@NgModule({
  imports: [
    CommonModule,
    MdInputModule,
    MdButtonModule,
    FormsModule,
    BrowserAnimationsModule,
    TangerineFormsModule,
    AuthRoutingModule
  ],
  providers: [LoginGuard, AuthenticationService, UserService],
  declarations: [LoginComponent, RegistrationComponent, LoginRemoteServerComponent, RegisterRemoteServerComponent, EditProfileComponent]
})
export class AuthModule { }
