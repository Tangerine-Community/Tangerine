import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NodeCreatorComponent } from './node-creator/node-creator.component';
import { LocationsCreatorComponent } from './locations-creator/locations-creator.component';
import { GroupManagerComponent } from './group-manager/group-manager.component';
import { LoginGuard } from '../core/auth/_guards/login-guard.service';
const routes: Routes = [{
    path: 'create-nodes',
    component: NodeCreatorComponent,
    canActivate: [LoginGuard]
}, {
    path: 'create-location',
    component: LocationsCreatorComponent,
    canActivate: [LoginGuard]
}, {
    path: 'create-group',
    component: GroupManagerComponent
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class NodeManagerRoutingModule { }
