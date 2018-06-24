import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginGuard } from '../core/auth/_guards/login-guard.service';
import { ProfileEditComponent } from './profile-edit.component';
import { ProfilePaidComponent } from './profile-paid.component';
// import { AuthGuard }                from '../auth-guard.service';
import { ProfileComponent } from './profile.component';
const profileRoutes: Routes = [
    { path: 'profile', component: ProfileComponent, canActivate: [LoginGuard] },
    { path: 'profile-paid', component: ProfilePaidComponent, canActivate: [LoginGuard] },
    { path: 'profile-edit', component: ProfileEditComponent, canActivate: [LoginGuard] },
];
@NgModule({
    imports: [
        RouterModule.forChild(profileRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class ProfileRoutingModule { }
