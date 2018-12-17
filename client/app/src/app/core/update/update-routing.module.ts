import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UpdateComponent } from './update/update.component'

const routes: Routes = [
  {
    path: 'update',
    component: UpdateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UpdateRoutingModule { }
