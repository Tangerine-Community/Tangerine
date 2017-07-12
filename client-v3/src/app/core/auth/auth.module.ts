import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { MdInputModule, MdButtonModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { RegistrationComponent } from './registration/registration.component';
import { LoginGuard } from './_guards/login-guard.service';
import { AuthenticationService } from './_services/authentication.service';
import { UserService } from './_services/user.service';
@NgModule({
  imports: [
    CommonModule,
    MdInputModule,
    MdButtonModule,
    FormsModule,
    BrowserAnimationsModule,
    AuthRoutingModule
  ],
  providers: [LoginGuard, AuthenticationService, UserService],
  declarations: [LoginComponent, RegistrationComponent]
})
export class AuthModule { }
