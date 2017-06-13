import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NodeCreatorComponent } from './node-creator/node-creator.component';
import { LocationsCreatorComponent } from './locations-creator/locations-creator.component';

const routes: Routes = [{
    path: 'create-nodes',
    component: NodeCreatorComponent
}, {
    path: 'create-location',
    component: LocationsCreatorComponent
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class NodeManagerRoutingModule { }
