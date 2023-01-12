import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './_components/login/login.component';
import { ManageUsersComponent } from './_components/manage-users/manage-users.component';
import { UserResgistrationComponent } from './_components/user-resgistration/user-resgistration.component';
import { LoginGuard } from './_guards/login-guard.service';
import { AuthenticationService } from './_services/authentication.service';
import { UserService } from './_services/user.service';
import { SuperAdminUserGuard } from './_guards/super-admin-user-guard.service';
import { ManageSitewidePermissionsComponent } from './_components/manage-sitewide-permissions/manage-sitewide-permissions.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EditUserComponent } from './_components/edit-user/edit-user.component';
import { UpdatePersonalProfileComponent } from './_components/update-personal-profile/update-personal-profile.component';
import { AddRoleToGroupComponent } from './_components/add-role-to-group/add-role-to-group.component';
import { UpdateGroupRolesComponent } from './_components/update-group-roles/update-group-roles.component';
import { AddUserToAGroupComponent } from './_components/add-user-to-a-group/add-user-to-a-group.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UpdateUserRoleComponent } from './_components/update-user-role/update-user-role.component';
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
        MatAutocompleteModule,
        SharedModule,
        MatTableModule,
        MatCheckboxModule,
        MatIconModule
    ],
  declarations: [UserResgistrationComponent, LoginComponent, ManageUsersComponent, ManageSitewidePermissionsComponent, EditUserComponent, UpdatePersonalProfileComponent, AddRoleToGroupComponent, UpdateGroupRolesComponent, AddUserToAGroupComponent, UpdateUserRoleComponent],
  providers: [AuthenticationService, LoginGuard, SuperAdminUserGuard, UserService]
})
export class AuthModule { }
