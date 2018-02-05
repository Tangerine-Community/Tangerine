import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { AuthGuard }                from '../auth-guard.service';

import { ProfileComponent }    from './profile.component';
import {AuthGuard} from "../auth-guard.service";
import {ProfileEditComponent} from "./profile-edit.component";
import {ProfilePaidComponent} from "./profile-paid.component";
const profileRoutes: Routes = [
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'profile-paid', component: ProfilePaidComponent, canActivate: [AuthGuard] },
    { path: 'profile-edit', component: ProfileEditComponent, canActivate: [AuthGuard] },
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
