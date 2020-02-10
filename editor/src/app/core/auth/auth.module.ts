import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, MatInputModule, MatListModule, MatSelectModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './_components/login/login.component';
import { ManageUsersComponent } from './_components/manage-users/manage-users.component';
import { UserResgistrationComponent } from './_components/user-resgistration/user-resgistration.component';
import { LoginGuard } from './_guards/login-guard.service';
import { AuthenticationService } from './_services/authentication.service';
import { UserService } from './_services/user.service';
import { AdminUserGuard } from './_guards/admin-user-guard.service';
import { SuperAdminUserGuard } from './_guards/super-admin-user-guard.service';
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AuthRoutingModule,
    SharedModule

  ],
  declarations: [UserResgistrationComponent, LoginComponent, ManageUsersComponent],
  providers: [AuthenticationService, LoginGuard, AdminUserGuard, SuperAdminUserGuard, UserService]
})
export class AuthModule { }
