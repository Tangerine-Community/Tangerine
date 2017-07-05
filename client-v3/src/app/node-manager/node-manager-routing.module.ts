import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NodeCreatorComponent } from './node-creator/node-creator.component';
import { LocationsCreatorComponent } from './locations-creator/locations-creator.component';
import {GroupManagerComponent} from "./group-manager/group-manager.component";

const routes: Routes = [{
    path: 'create-nodes',
    component: NodeCreatorComponent
}, {
    path: 'create-location',
    component: LocationsCreatorComponent
}, {
  path: 'create-group',
  component: GroupManagerComponent
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class NodeManagerRoutingModule { }
